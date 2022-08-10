var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

var TEST_BUFFER_STEPS = {
    STANDBY: 0,
    POS_1: 1,
    POS_2: 2,
    COMPLETED: 3
}

var TEST_BUFFER_LOG = {
    RULE: "BUFFER_TEST_MOVEMENT",
    POS_1: "first buffer test position",
    POS_2: "second buffer test position",
    COMPLETED: "COMPLETED_BUFFER_TEST_GO_TO_BEGINNING"
}

function test_buffer() {
    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var buffer_motor_name = config.UNP_BUFFER_MOTOR_PREFIX + unpacker_index;
        var unpacker_sensor = config.UNP_SENSOR_PREFIX + unpacker_index;

        defineRule(unpacker_name + "_test_buffer" + TEST_BUFFER_STEPS.STANDBY, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["buffer_current_step"] == TEST_BUFFER_STEPS.STANDBY &&
                    !drivers.UNP_MOTOR_DRIVER_OBJ.check_sensor_state(buffer_motor_name, dev[unpacker_sensor]["buffer_limit_sensor"])
            },
            then: function() {
                dev[unpacker_name]["buffer_requested_pos"] = 10000;
                buffer_pos_2 = dev[unpacker_name]["buffer_requested_pos"] + 5000;
                log.info("First buffer position: ", dev[unpacker_name]["buffer_requested_pos"])
                log.info("Second buffer position: ", buffer_pos_2)
                UNP_MODEL_FUNC.buffer_log(unpacker_name, TEST_BUFFER_LOG.RULE, TEST_BUFFER_LOG.POS_1, dev[unpacker_name]["buffer_current_step"]);
                dev[unpacker_name]["buffer_current_step"] = TEST_BUFFER_STEPS.POS_1;
            }
        });

        defineRule(unpacker_name + "_test_buffer_pos_" + TEST_BUFFER_STEPS.POS_1, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["buffer_current_step"] == TEST_BUFFER_STEPS.POS_1 &&
                    dev[unpacker_name]["buffer_requested_pos"] == 10000
            },
            then: function() {
                log.info("first buffer test step, position = 10000");
                UNP_MODEL_FUNC.buffer_motor_pos_control_request(unpacker_name, buffer_motor_name, dev[unpacker_name]["buffer_requested_pos"], !dev[unpacker_name]["buffer_calib_direction"], dev[unpacker_name]["buffer_default_speed"], dev[unpacker_name]["buffer_default_acc"])
                UNP_MODEL_FUNC.buffer_log(unpacker_name, TEST_BUFFER_LOG.RULE, TEST_BUFFER_LOG.POS_2, dev[unpacker_name]["buffer_current_step"]);
                dev[unpacker_name]["buffer_current_step"] = TEST_BUFFER_STEPS.POS_2;
            }
        });

        defineRule(unpacker_name + "_test_buffer_pos_" + TEST_BUFFER_STEPS.POS_2, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["buffer_current_step"] == TEST_BUFFER_STEPS.POS_2 &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(buffer_motor_name, dev[unpacker_name]["buffer_requested_pos"]) &&
                    buffer_pos_2 == 15000
            },
            then: function() {
                log.info("second buffer test step, position = 15000")
                UNP_MODEL_FUNC.buffer_motor_pos_control_request(unpacker_name, buffer_motor_name, buffer_pos_2, !dev[unpacker_name]["buffer_calib_direction"], dev[unpacker_name]["buffer_default_speed"], dev[unpacker_name]["buffer_default_acc"])
                UNP_MODEL_FUNC.buffer_log(unpacker_name, TEST_BUFFER_LOG.RULE, TEST_BUFFER_LOG.COMPLETED, dev[unpacker_name]["buffer_current_step"]);
                dev[unpacker_name]["buffer_current_step"] = TEST_BUFFER_STEPS.POS_2;
            }
        });

        defineRule(unpacker_name + "_test_buffer_pos_" + TEST_BUFFER_STEPS.COMPLETED, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["buffer_current_step"] == TEST_BUFFER_STEPS.COMPLETED &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(buffer_motor_name, buffer_pos_2)
            },
            then: function() {
                log.info("buffer test cycle completed!");
                log.info("go to next buffer test cycle ->");
                UNP_MODEL_FUNC.buffer_log(unpacker_name, TEST_BUFFER_LOG.RULE, TEST_BUFFER_LOG.STANDBY, dev[unpacker_name]["buffer_current_step"]);
                dev[unpacker_name]["buffer_current_step"] = TEST_BUFFER_STEPS.STANDBY;
            }
        });
    }
}

test_buffer()