var CALIB_STEPS = {
    STANDBY: 0,
    RUNNING: 1,
    CHECK_SENSOR: 2,
    RUNNING_BACK: 3,
    CHECK_SENSOR_BACK: 4
}

var CALIB_LOG = {
    RULE: "CALIBRATION AXIS X",
    RUNNING: "running forward in speed control mode",
    CHECK_SENSOR: "waiting limit sensor on",
    RUNNING_BACK: "running back in speed control mode",
    CHECK_SENSOR_BACK: "waiting limit sensor off",
    STOP_BACK_MOVE: "stop motor",
    COMPLETED: "calibration completed"
}
var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

function man_x_calib_definition() {

    defineRule(config.MAN_PREFIX + "_x_calib" + CALIB_STEPS.STANDBY, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.AXIS_X_CALIB &&
                dev["man"]["current_step"] == CALIB_STEPS.STANDBY;
        },
        then: function() {
            if (drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"]) &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"])) {
                dev[config.MAN_PREFIX]["current_step"] = CALIB_STEPS.RUNNING_BACK;
                MAN_MODEL_FUNC.log(config.MAN_PREFIX, CALIB_LOG.RULE, CALIB_LOG.RUNNING_BACK, dev[config.MAN_PREFIX]["current_step"]);
            } else {
                dev[config.MAN_PREFIX]["current_step"] = CALIB_STEPS.RUNNING;
                MAN_MODEL_FUNC.log(config.MAN_PREFIX, CALIB_LOG.RULE, CALIB_LOG.RUNNING, dev[config.MAN_PREFIX]["current_step"]);
            }
        }
    });

    defineRule(config.MAN_PREFIX + "_x_calib" + CALIB_STEPS.RUNNING, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.AXIS_X_CALIB &&
                dev["man"]["current_step"] == CALIB_STEPS.RUNNING;
        },
        then: function() {
            var sensor_l = drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"])
            var sensor_u = drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"])
            if (!sensor_l && !sensor_u) {
                MAN_MODEL_FUNC.axis_x_motor_speed_control_request(dev[config.MAN_PREFIX]["axis_x_default_calib_reverse"], dev[config.MAN_PREFIX]["axis_x_default_calib_speed_high"], dev[config.MAN_PREFIX]["axis_x_default_calib_acc"]);
            }
            if (!sensor_l && sensor_u) {
                MAN_MODEL_FUNC.axis_x_l_motor_speed_control_request(dev[config.MAN_PREFIX]["axis_x_default_calib_reverse"], dev[config.MAN_PREFIX]["axis_x_default_calib_speed_high"], dev[config.MAN_PREFIX]["axis_x_default_calib_acc"]);
            }
            if (sensor_l && !sensor_u) {
                MAN_MODEL_FUNC.axis_x_u_motor_speed_control_request(dev[config.MAN_PREFIX]["axis_x_default_calib_reverse"], dev[config.MAN_PREFIX]["axis_x_default_calib_speed_high"], dev[config.MAN_PREFIX]["axis_x_default_calib_acc"]);
            }
            dev[config.MAN_PREFIX]["current_step"] = CALIB_STEPS.CHECK_SENSOR;
            MAN_MODEL_FUNC.log(config.MAN_PREFIX, CALIB_LOG.RULE, CALIB_LOG.CHECK_SENSOR, dev[config.MAN_PREFIX]["current_step"]);
        }
    });

    defineRule(config.MAN_PREFIX + "_x_calib_l" + CALIB_STEPS.CHECK_SENSOR, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.AXIS_X_CALIB &&
                dev["man"]["current_step"] == CALIB_STEPS.CHECK_SENSOR &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"]);
        },
        then: function() {
            drivers.MAN_MOTOR_DRIVER_OBJ.emergency_stop(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_default_emergency_dec"]);
            if (drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"])) {
                dev[config.MAN_PREFIX]["current_step"] = CALIB_STEPS.RUNNING_BACK;
                MAN_MODEL_FUNC.log(config.MAN_PREFIX, CALIB_LOG.RULE, CALIB_LOG.RUNNING_BACK, dev[config.MAN_PREFIX]["current_step"]);
            }
        }
    });

    defineRule(config.MAN_PREFIX + "_x_calib_u" + CALIB_STEPS.CHECK_SENSOR, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.AXIS_X_CALIB &&
                dev["man"]["current_step"] == CALIB_STEPS.CHECK_SENSOR &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"]);
        },
        then: function() {
            drivers.MAN_MOTOR_DRIVER_OBJ.emergency_stop(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_default_emergency_dec"]);
            if (drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"])) {
                dev[config.MAN_PREFIX]["current_step"] = CALIB_STEPS.RUNNING_BACK;
                MAN_MODEL_FUNC.log(config.MAN_PREFIX, CALIB_LOG.RULE, CALIB_LOG.RUNNING_BACK, dev[config.MAN_PREFIX]["current_step"]);
            }
        }
    });

    defineRule(config.MAN_PREFIX + "_x_calib" + CALIB_STEPS.RUNNING_BACK, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.AXIS_X_CALIB &&
                dev["man"]["current_step"] == CALIB_STEPS.RUNNING_BACK &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_running_completed(config.MAN_X_L_PREFIX) &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_running_completed(config.MAN_X_U_PREFIX);
        },
        then: function() {
            MAN_MODEL_FUNC.axis_x_motor_speed_control_request(!dev[config.MAN_PREFIX]["axis_x_default_calib_reverse"], dev[config.MAN_PREFIX]["axis_x_default_calib_speed_low"], dev[config.MAN_PREFIX]["axis_x_default_calib_acc"])
            dev[config.MAN_PREFIX]["current_step"] = CALIB_STEPS.CHECK_SENSOR_BACK;
            MAN_MODEL_FUNC.log(config.MAN_PREFIX, CALIB_LOG.RULE, CALIB_LOG.CHECK_SENSOR_BACK, dev[config.MAN_PREFIX]["current_step"]);
        }
    });

    defineRule(config.MAN_PREFIX + "_x_calib_l" + CALIB_STEPS.CHECK_SENSOR_BACK, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.AXIS_X_CALIB &&
                dev["man"]["current_step"] == CALIB_STEPS.CHECK_SENSOR_BACK &&
                !drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"]);
        },
        then: function() {
            drivers.MAN_MOTOR_DRIVER_OBJ.clear_position(config.MAN_X_L_PREFIX);
            drivers.MAN_MOTOR_DRIVER_OBJ.emergency_stop(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_default_emergency_dec"])
        }
    });

    defineRule(config.MAN_PREFIX + "_x_calib_u" + CALIB_STEPS.CHECK_SENSOR_BACK, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.AXIS_X_CALIB &&
                dev["man"]["current_step"] == CALIB_STEPS.CHECK_SENSOR_BACK &&
                !drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"]);
        },
        then: function() {
            drivers.MAN_MOTOR_DRIVER_OBJ.clear_position(config.MAN_X_U_PREFIX);
            drivers.MAN_MOTOR_DRIVER_OBJ.emergency_stop(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_default_emergency_dec"])
        }
    });

    defineRule(config.MAN_PREFIX + "_x_calib" + CALIB_STEPS.CHECK_SENSOR_BACK, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.AXIS_X_CALIB &&
                dev["man"]["current_step"] == CALIB_STEPS.CHECK_SENSOR_BACK &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_running_completed(config.MAN_X_L_PREFIX) &&
                !drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"]) &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_running_completed(config.MAN_X_U_PREFIX) &&
                !drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"]);
        },
        then: function() {
            MAN_MODEL_FUNC.set_default_ready_state(config.MAN_PREFIX);
            MAN_MODEL_FUNC.log(config.MAN_PREFIX, CALIB_LOG.RULE, CALIB_LOG.COMPLETED, dev[config.MAN_PREFIX]["current_step"]);
        }
    });
}
man_x_calib_definition();