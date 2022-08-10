var TEST_ARM_STEPS = {
    STANDBY: 0,
    RUNNING: 1,
    CHECK_SENSOR: 2,
    RUNNING_BACK: 3,
    CHECK_SENSOR_BACK: 4,
    STOP_BACK_MOVE: 5,
    POS_1: 6,
    POS_2: 7,
    COMPLETED_MOVE: 8
}

var TEST_ARM_LOG = {
    RULE: "CALIBRATION ARM",
    RUNNING: "running forward in speed control mode",
    CHECK_SENSOR: "waiting limit sensor on",
    RUNNING_BACK: "running back in speed control mode",
    CHECK_SENSOR_BACK: "waiting limit sensor off",
    STOP_BACK_MOVE: "stop motor, calibration completed",
    POS_1: "first arm test position",
    POS_2: "second arm test position",
    COMPLETED_MOVE: "COMPLETED_ARM_TEST_GO_TO_BEGINNING "
}
var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

function test_arm() {
    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var arm_motor_name = config.UNP_ARM_MOTOR_PREFIX + unpacker_index;
        var unpacker_sensor = config.UNP_SENSOR_PREFIX + unpacker_index;

        defineRule(unpacker_name + "_test_arm_calib_" + TEST_ARM_STEPS.STANDBY, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["current_step"] == TEST_ARM_STEPS.STANDBY;
            },
            then: function() {
                if (drivers.UNP_MOTOR_DRIVER_OBJ.check_sensor_state(arm_motor_name, dev[unpacker_sensor]["arm_limit_sensor"])) {
                    dev[unpacker_name]["current_step"] = TEST_ARM_STEPS.RUNNING_BACK;
                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, TEST_ARM_LOG.RULE, TEST_ARM_LOG.RUNNING_BACK, dev[unpacker_name]["current_step"]);
                } else {
                    dev[unpacker_name]["current_step"] = TEST_ARM_STEPS.RUNNING;
                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, TEST_ARM_LOG.RULE, TEST_ARM_LOG.RUNNING, dev[unpacker_name]["current_step"]);
                }
            }
        });

        defineRule(unpacker_name + "_test_arm_calib_" + TEST_ARM_STEPS.RUNNING, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["current_step"] == TEST_ARM_STEPS.RUNNING;
            },
            then: function() {
                if (!drivers.UNP_MOTOR_DRIVER_OBJ.check_sensor_state(arm_motor_name, dev[unpacker_sensor]["arm_limit_sensor"])) {
                    log.info("go to first arm calib step");
                    UNP_MODEL_FUNC.arm_motor_speed_control_request(unpacker_name, arm_motor_name, dev[unpacker_name]["arm_calib_direction"], dev[unpacker_name]["arm_calib_speed_low"], dev[unpacker_name]["arm_default_acc"])
                    dev[unpacker_name]["current_step"] = TEST_ARM_STEPS.CHECK_SENSOR;
                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, TEST_ARM_LOG.RULE, TEST_ARM_LOG.CHECK_SENSOR, dev[unpacker_name]["current_step"]);
                }
            }
        });

        defineRule(unpacker_name + "_test_arm_calib_" + TEST_ARM_STEPS.CHECK_SENSOR, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["current_step"] == TEST_ARM_STEPS.CHECK_SENSOR &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_sensor_state(arm_motor_name, dev[unpacker_sensor]["arm_limit_sensor"])
            },
            then: function() {
                log.info("first emergency stop arm calib step");
                drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(arm_motor_name, dev[unpacker_name]["arm_emergency_dec"]);
                if (drivers.UNP_MOTOR_DRIVER_OBJ.check_sensor_state(arm_motor_name, dev[unpacker_name]["arm_limit_sensor"])) {
                    dev[unpacker_name]["current_step"] = TEST_ARM_STEPS.RUNNING_BACK;
                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, TEST_ARM_LOG.RULE, TEST_ARM_LOG.RUNNING_BACK, dev[unpacker_name]["current_step"]);
                }
            }
        });

        defineRule(unpacker_name + "_test_arm_calib_" + TEST_ARM_STEPS.RUNNING_BACK, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["current_step"] == TEST_ARM_STEPS.RUNNING_BACK &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_running_completed(arm_motor_name)
            },
            then: function() {
                log.info("go to second arm calib step");
                UNP_MODEL_FUNC.arm_motor_speed_control_request(unpacker_name, arm_motor_name, !dev[unpacker_name]["arm_calib_direction"], dev[unpacker_name]["arm_calib_speed_low"], dev[unpacker_name]["arm_default_acc"])
                dev[unpacker_name]["current_step"] = TEST_ARM_STEPS.CHECK_SENSOR_BACK;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, TEST_ARM_LOG.RULE, TEST_ARM_LOG.CHECK_SENSOR_BACK, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_test_arm_calib_" + TEST_ARM_STEPS.CHECK_SENSOR_BACK, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["current_step"] == TEST_ARM_STEPS.CHECK_SENSOR_BACK &&
                    !drivers.UNP_MOTOR_DRIVER_OBJ.check_running_completed(arm_motor_name)
            },
            then: function() {
                log.info("second emergency stop arm calib step");
                drivers.UNP_MOTOR_DRIVER_OBJ.clear_position(arm_motor_name)
                drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(arm_motor_name, dev[unpacker_name]["arm_emergency_dec"]);
                dev[unpacker_name]["current_step"] = TEST_ARM_STEPS.STOP_BACK_MOVE;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, TEST_ARM_LOG.RULE, TEST_ARM_LOG.STOP_BACK_MOVE, dev[unpacker_name]["arm_current_step"]);
            }
        });

        defineRule(unpacker_name + "_test_arm_calib_" + TEST_ARM_STEPS.STOP_BACK_MOVE, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["current_step"] == TEST_ARM_STEPS.CHECK_SENSOR_BACK &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_running_completed(arm_motor_name) &&
                    !drivers.UNP_MOTOR_DRIVER_OBJ.check_sensor_state(arm_motor_name, dev[unpacker_sensor]["arm_limit_sensor"])
            },
            then: function() {
                log.info("arm calibration completed, go to pos control ->")
                dev[unpacker_name]["arm_requested_pos"] = 1000;
                arm_pos_2 = dev[unpacker_name]["arm_requested_pos"] - 500;
                log.info("First arm position: ", dev[unpacker_name]["arm_requested_pos"])
                log.info("Second arm position: ", arm_pos_2)
                dev[unpacker_name]["current_step"] = TEST_ARM_STEPS.POS_1;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, TEST_ARM_LOG.RULE, TEST_ARM_LOG.POS_1, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_test_arm_calib_" + TEST_ARM_STEPS.POS_1, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["current_step"] == TEST_ARM_STEPS.POS_1 &&
                    dev[unpacker_name]["arm_requested_pos"] == 1000
            },
            then: function() {
                log.info("first arm test step, position = 1000");
                UNP_MODEL_FUNC.arm_motor_pos_control_request(unpacker_name, arm_motor_name, dev[unpacker_name]["arm_requested_pos"], !dev[unpacker_name]["arm_calib_direction"], dev[unpacker_name]["arm_default_speed"], dev[unpacker_name]["arm_default_acc"])
                dev[unpacker_name]["current_step"] = TEST_ARM_STEPS.POS_2;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, TEST_ARM_LOG.RULE, TEST_ARM_LOG.POS_2, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_test_arm_calib_" + TEST_ARM_STEPS.POS_2, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["current_step"] == TEST_ARM_STEPS.POS_2 &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(arm_motor_name, dev[unpacker_name]["arm_requested_pos"])
            },
            then: function() {
                log.info("second arm test step, position = 1500");
                UNP_MODEL_FUNC.arm_motor_pos_control_request(unpacker_name, arm_motor_name, arm_pos_2, !dev[unpacker_name]["arm_calib_direction"], dev[unpacker_name]["arm_default_speed"], dev[unpacker_name]["arm_default_acc"])
                dev[unpacker_name]["current_step"] = TEST_ARM_STEPS.COMPLETED_MOVE;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, TEST_ARM_LOG.RULE, TEST_ARM_LOG.COMPLETED_MOVE, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_test_arm_calib_" + TEST_ARM_STEPS.POS_2, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.TEST &&
                    dev[unpacker_name]["current_step"] == TEST_ARM_STEPS.POS_2 &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(arm_motor_name, dev[unpacker_name]["arm_requested_pos"])
            },
            then: function() {
                log.info("arm test calibration and pos test cycle completed!");
                log.info("go to next arm test cycle ->");
                dev[unpacker_name]["current_step"] = TEST_ARM_STEPS.STANDBY;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, TEST_ARM_LOG.RULE, TEST_ARM_LOG.STANDBY, dev[unpacker_name]["current_step"]);
            }
        });
    }
}

test_arm();