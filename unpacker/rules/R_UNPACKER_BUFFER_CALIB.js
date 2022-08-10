var BUFFER_CALIB_STEPS = {
    STANDBY: 0,
    RUNNING: 1,
    CHECK_SENSOR: 2,
    RUNNING_BACK: 3,
    CHECK_SENSOR_BACK: 4,
    STOP_BACK_MOVE: 5
}

var BUFFER_CALIB_LOG = {
    RULE: "CALIBRATION BUFFER",
    RUNNING: "running forward in speed control mode",
    CHECK_SENSOR: "waiting limit sensor on",
    RUNNING_BACK: "running back in speed control mode",
    CHECK_SENSOR_BACK: "waiting limit sensor off",
    STOP_BACK_MOVE: "stop motor",
    COMPLETED: "calibration completed"
}

var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

function unpacker_buffer_calib_definition() {
    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var buffer_motor_name = config.UNP_BUFFER_MOTOR_PREFIX + unpacker_index;
        var unpacker_sensor = config.UNP_SENSOR_PREFIX + unpacker_index;

        defineRule(unpacker_name + "_buffer_calib" + BUFFER_CALIB_STEPS.STANDBY, {
            when: function() {
                return dev[unpacker_name]["buffer_current_rule"] == config.UNP_RULES.BUFFER_CALIB &&
                    dev[unpacker_name]["buffer_current_step"] == BUFFER_CALIB_STEPS.STANDBY;
            },
            then: function() {
                if (drivers.UNP_MOTOR_DRIVER_OBJ.check_sensor_state(buffer_motor_name, dev[unpacker_sensor]["buffer_limit_sensor"])) {
                    dev[unpacker_name]["buffer_current_step"] = BUFFER_CALIB_STEPS.RUNNING_BACK;
                    UNP_MODEL_FUNC.buffer_log(unpacker_name, BUFFER_CALIB_LOG.RULE, BUFFER_CALIB_LOG.RUNNING_BACK, dev[unpacker_name]["buffer_current_step"]);
                } else {
                    dev[unpacker_name]["buffer_current_step"] = BUFFER_CALIB_STEPS.RUNNING;
                    UNP_MODEL_FUNC.buffer_log(unpacker_name, BUFFER_CALIB_LOG.RULE, BUFFER_CALIB_LOG.RUNNING, dev[unpacker_name]["buffer_current_step"]);
                }
            }
        });

        defineRule(unpacker_name + "_buffer_calib" + BUFFER_CALIB_STEPS.RUNNING, {
            when: function() {
                return dev[unpacker_name]["buffer_current_rule"] == config.UNP_RULES.BUFFER_CALIB &&
                    dev[unpacker_name]["buffer_current_step"] == BUFFER_CALIB_STEPS.RUNNING;
            },
            then: function() {
                if (!drivers.UNP_MOTOR_DRIVER_OBJ.check_sensor_state(buffer_motor_name, dev[unpacker_sensor]["buffer_limit_sensor"])) {
                    UNP_MODEL_FUNC.buffer_motor_speed_control_request(unpacker_name, buffer_motor_name, dev[unpacker_name]["buffer_calib_direction"], dev[unpacker_name]["buffer_calib_speed_low"], dev[unpacker_name]["buffer_default_acc"])
                    dev[unpacker_name]["buffer_current_step"] = BUFFER_CALIB_STEPS.CHECK_SENSOR;
                    UNP_MODEL_FUNC.buffer_log(unpacker_name, BUFFER_CALIB_LOG.RULE, BUFFER_CALIB_LOG.CHECK_SENSOR, dev[unpacker_name]["buffer_current_step"]);
                }
            }
        });

        defineRule(unpacker_name + "_buffer_calib" + BUFFER_CALIB_STEPS.CHECK_SENSOR, {
            when: function() {
                return dev[unpacker_name]["buffer_current_rule"] == config.UNP_RULES.BUFFER_CALIB &&
                    dev[unpacker_name]["buffer_current_step"] == BUFFER_CALIB_STEPS.CHECK_SENSOR &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_sensor_state(buffer_motor_name, dev[unpacker_sensor]["buffer_limit_sensor"])
            },
            then: function() {
                drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(buffer_motor_name, dev[unpacker_name]["buffer_emergency_dec"]);
                if (drivers.UNP_MOTOR_DRIVER_OBJ.check_sensor_state(buffer_motor_name, dev[unpacker_name]["buffer_limit_sensor"])) {
                    dev[unpacker_name]["buffer_current_step"] = BUFFER_CALIB_STEPS.RUNNING_BACK;
                    UNP_MODEL_FUNC.buffer_log(unpacker_name, BUFFER_CALIB_LOG.RULE, BUFFER_CALIB_LOG.RUNNING_BACK, dev[unpacker_name]["buffer_current_step"]);
                }
            }
        });

        defineRule(unpacker_name + "_buffer_calib" + BUFFER_CALIB_STEPS.RUNNING_BACK, {
            when: function() {
                return dev[unpacker_name]["buffer_current_rule"] == config.UNP_RULES.BUFFER_CALIB &&
                    dev[unpacker_name]["buffer_current_step"] == BUFFER_CALIB_STEPS.RUNNING_BACK &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_running_completed(buffer_motor_name)
            },
            then: function() {
                UNP_MODEL_FUNC.buffer_motor_speed_control_request(unpacker_name, buffer_motor_name, !dev[unpacker_name]["buffer_calib_direction"], dev[unpacker_name]["buffer_calib_speed_low"], dev[unpacker_name]["buffer_default_acc"])
                dev[unpacker_name]["buffer_current_step"] = BUFFER_CALIB_STEPS.CHECK_SENSOR_BACK;
                UNP_MODEL_FUNC.buffer_log(unpacker_name, BUFFER_CALIB_LOG.RULE, BUFFER_CALIB_LOG.CHECK_SENSOR_BACK, dev[unpacker_name]["buffer_current_step"]);
            }
        });

        defineRule(unpacker_name + "_buffer_calib" + BUFFER_CALIB_STEPS.CHECK_SENSOR_BACK, {
            when: function() {
                return dev[unpacker_name]["buffer_current_rule"] == config.UNP_RULES.BUFFER_CALIB &&
                    dev[unpacker_name]["buffer_current_step"] == BUFFER_CALIB_STEPS.CHECK_SENSOR_BACK &&
                    !drivers.UNP_MOTOR_DRIVER_OBJ.check_running_completed(buffer_motor_name)
            },
            then: function() {
                drivers.UNP_MOTOR_DRIVER_OBJ.clear_position(buffer_motor_name)
                drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(buffer_motor_name, dev[unpacker_name]["buffer_emergency_dec"]);
                dev[unpacker_name]["buffer_current_step"] = BUFFER_CALIB_STEPS.STOP_BACK_MOVE;
                UNP_MODEL_FUNC.buffer_log(unpacker_name, BUFFER_CALIB_LOG.RULE, BUFFER_CALIB_LOG.STOP_BACK_MOVE, dev[unpacker_name]["buffer_current_step"]);
            }
        });

        defineRule(unpacker_name + "_buffer_calib" + BUFFER_CALIB_STEPS.STOP_BACK_MOVE, {
            when: function() {
                return dev[unpacker_name]["buffer_current_rule"] == config.UNP_RULES.BUFFER_CALIB &&
                    dev[unpacker_name]["buffer_current_step"] == BUFFER_CALIB_STEPS.CHECK_SENSOR_BACK &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_running_completed(buffer_motor_name) &&
                    !drivers.UNP_MOTOR_DRIVER_OBJ.check_sensor_state(buffer_motor_name, dev[unpacker_sensor]["buffer_limit_sensor"])
            },
            then: function() {
                UNP_MODEL_FUNC.set_default_ready_state(unpacker_name)
                UNP_MODEL_FUNC.buffer_log(unpacker_name, BUFFER_CALIB_LOG.RULE, BUFFER_CALIB_LOG.COMPLETED, dev[unpacker_name]["buffer_current_step"]);
            }
        });
    }
}

unpacker_buffer_calib_definition();