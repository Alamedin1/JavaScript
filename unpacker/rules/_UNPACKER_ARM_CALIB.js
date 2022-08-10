var ARM_CALIB_STEPS = {
    STANDBY: 0,
    RUNNING: 1,
    CHECK_SENSOR: 2,
    STOP_MOVE: 3,
    RUNNING_BACK: 4,
    CHECK_SENSOR_BACK: 5,
    STOP_BACK_MOVE: 6
}

var ARM_CALIB_LOG = {
    RULE: "CALIBRATION ARM",
    RUNNING: "running forward in speed control mode",
    CHECK_SENSOR: "waiting limit sensor on",
    STOP_MOVE: "checking stoped",
    RUNNING_BACK: "running back in speed control mode",
    CHECK_SENSOR_BACK: "waiting limit sensor off",
    STOP_BACK_MOVE: "stop motor",
    COMPLETED: "calibration completed"
}
var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

function unpacker_arm_calib_definition() {
    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var arm_motor_name = config.UNP_ARM_MOTOR_PREFIX + unpacker_index;
        var unpacker_sensor = config.UNP_SENSOR_PREFIX + unpacker_index;
        defineRule(unpacker_name + "_arm_calib", {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.ARM_CALIB;
            },
            then: function() {
                if (dev[unpacker_name]["current_step"] == ARM_CALIB_STEPS.STANDBY) {

                    dev[unpacker_name]["current_step"] = ARM_CALIB_STEPS.RUNNING;
                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, ARM_CALIB_LOG.RULE, ARM_CALIB_LOG.RUNNING, dev[unpacker_name]["current_step"]);

                    var cycle_timer = setInterval(function() {
                        if (dev[unpacker_name]["timer_off_flag"]) {
                            dev[unpacker_name]["timer_off_flag"] = false;
                            clearInterval(cycle_timer);
                        }
                        switch (dev[unpacker_name]["current_step"]) {
                            case ARM_CALIB_STEPS.RUNNING:
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_speed_config(arm_motor_name, dev[unpacker_name]["arm_calib_speed_high"], dev[unpacker_name]["arm_default_acc"], dev[unpacker_name]["arm_default_acc"], dev[unpacker_name]["arm_calib_direction"])) {
                                    dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, ARM_CALIB_LOG.RULE, ARM_CALIB_LOG.CHECK_SENSOR, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case ARM_CALIB_STEPS.CHECK_SENSOR:
                                if (drivers.UNP_SENSOR_DRIVER_OBJ.check_arm_limit_sensor(unpacker_sensor)) {
                                    dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, ARM_CALIB_LOG.RULE, ARM_CALIB_LOG.STOP_MOVE, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case ARM_CALIB_STEPS.STOP_MOVE:
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(arm_motor_name, dev[unpacker_name]["arm_default_emergency_dec"])) {
                                    dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, ARM_CALIB_LOG.RULE, ARM_CALIB_LOG.RUNNING_BACK, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case ARM_CALIB_STEPS.RUNNING_BACK:
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_speed_config(arm_motor_name, dev[unpacker_name]["arm_calib_speed_low"], dev[unpacker_name]["arm_default_acc"], dev[unpacker_name]["arm_default_acc"], !dev[unpacker_name]["arm_calib_direction"])) {
                                    dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, ARM_CALIB_LOG.RULE, ARM_CALIB_LOG.CHECK_SENSOR_BACK, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case ARM_CALIB_STEPS.CHECK_SENSOR_BACK:
                                if (!drivers.UNP_SENSOR_DRIVER_OBJ.check_arm_limit_sensor(unpacker_sensor)) {
                                    drivers.UNP_MOTOR_DRIVER_OBJ.clear_position(arm_motor_name);
                                    dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, ARM_CALIB_LOG.RULE, ARM_CALIB_LOG.STOP_BACK_MOVE, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case ARM_CALIB_STEPS.STOP_BACK_MOVE:
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(arm_motor_name, dev[unpacker_name]["arm_default_emergency_dec"])) {
                                    UNP_MODEL_FUNC.set_default_ready_state(unpacker_name);
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, ARM_CALIB_LOG.RULE, ARM_CALIB_LOG.COMPLETED, dev[unpacker_name]["current_step"]);
                                    clearInterval(cycle_timer);
                                }
                                break;
                        }
                    }, config.CYCLE_INTERVAL);
                }
            }
        });
    }
}

unpacker_arm_calib_definition();