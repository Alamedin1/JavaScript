var UNPACK_STEPS = {
    STANDBY: 0,
    RUNNING_ARM_MOTOR: 1,
    ACTUATOR_ON: 2,
    CHECK_GRIPPER_TRAY_SENSOR: 3,
    ACTUATOR_OFF: 4,
    GRIPPER_STATE_CLOSE: 5,
    ARM_RUNNING_ON_POS: 6,
    CATAPULTA_RUNNING_HIGH_POS: 7,
    VACUUM_SET_ON: 8,
    CATAPULTA_RUNNING_LOW_POS: 9,
    CATAPULTA_RUNNING_OPEN: 10,
    CATAPULTA_CHECK_OPENED: 11,
    CATAPULTA_STOP_ON_OPEN: 12,
    ARM_RUNNING_OUT_POS: 13,
    CATAPULTA_RUNNING_THROW_POS: 14,
    ARM_RUNNING_THROW_POS: 15,
    CATAPULTA_RUNNING_DOUBLE_BACK_SPEED: 16,
    CATAPULTA_RUNNING_DOUBLE_SPEED: 17,
    CHECK_DOUBLE_COUNTER: 18,
    CATAPULTA_RUNNING_HOMING_OPENED: 19,
    CHECK_OPEN_SENSOR: 20,
    CHECK_OPEN_SENSOR_OFF: 21,
    CATAPULTA_STOP_HOMING_OPENED: 22,
    CATAPULTA_RUNNING_HOMING: 23,
    CATAPULTA_CHECK_LIMIT_SENSOR: 24,
    CATAPULTA_STOP_HOMING: 25
}

var UNPACK_LOG = {
    RULE: "UNPACKER UNPACK",
    RUNNING_ARM_MOTOR: "running arm in middle pos/gripper open ",
    ACTUATOR_ON: "tray pusher on",
    CHECK_GRIPPER_TRAY_SENSOR: "check gripper sensor",
    ACTUATOR_OFF: "tray pusher off",
    GRIPPER_STATE_CLOSE: "gripper closed",
    ARM_RUNNING_ON_POS: "arm running in on pos",
    CATAPULTA_RUNNING_HIGH_POS: "catapulta running in high pos",
    VACUUM_SET_ON: "vacuum pump on",
    CATAPULTA_RUNNING_LOW_POS: "catapulta running in low pos",
    CATAPULTA_RUNNING_OPEN: "catapulta running in open in speed control",
    CATAPULTA_CHECK_OPENED: "check opened sensor",
    CATAPULTA_STOP_ON_OPEN: "catpulta stop open",
    ARM_RUNNING_OUT_POS: "arm running in out pos",
    CATAPULTA_RUNNING_THROW_POS: "catapulta running in throw pos",
    ARM_RUNNING_THROW_POS: "arm running in throw pos",
    CATAPULTA_RUNNING_DOUBLE_BACK_SPEED: "catapulta running in double back pos",
    CATAPULTA_RUNNING_DOUBLE_SPEED: "catapulta running in double pos",
    CHECK_DOUBLE_COUNTER: "check double move finished",
    CATAPULTA_RUNNING_HOMING_OPENED: "catapulta opened sensor homing",
    CHECK_OPEN_SENSOR: "check open sensor on",
    CHECK_OPEN_SENSOR_OFF: "check open sensor off",
    CATAPULTA_STOP_HOMING_OPENED: "stop first homing",
    CATAPULTA_RUNNING_HOMING: "catapulta running in homing in speed control",
    CATAPULTA_CHECK_LIMIT_SENSOR: "check limit sensor",
    CATAPULTA_STOP_HOMING: "catapulta stoped",
    COMPLETED: "unpack completed"
}

var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

function unpacker_unpack_definition() {
    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var unpacker_sensor = config.UNP_SENSOR_PREFIX + unpacker_index;
        var unpacker_actuator = config.UNP_ACTUATOR_PREFIX + unpacker_index;
        var arm_motor_name = config.UNP_ARM_MOTOR_PREFIX + unpacker_index;
        var catapulta_motor_name = config.UNP_CATAPULTA_MOTOR_PREFIX + unpacker_index;

        var catapulta_double_counter = 0;

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.ARM_RUNNING_OUT_POS, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.ARM_RUNNING_OUT_POS;
            },
            then: function() {
                catapulta_double_counter = 0;
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_THROW_POS;
            }
        });

        function catapulta_motor_pos_control_request(catapulta_motor_name, requested_pos, requested_dir, requested_speed, requested_acc) {
            dev[unpacker_name]["catapulta_requested_pos"] = requested_pos;
            dev[unpacker_name]["catapulta_requested_dir"] = requested_dir;
            dev[unpacker_name]["catapulta_requested_speed"] = requested_speed;
            dev[unpacker_name]["catapulta_requested_acc"] = requested_acc;
            drivers.UNP_MOTOR_DRIVER_OBJ.set_pos_config(catapulta_motor_name, requested_pos, requested_speed, requested_acc, requested_acc, requested_dir);
            dev[unpacker_name]["catapulta_run_pos_control"] = true;
        }

        function catapulta_motor_speed_control_request(catapulta_motor_name, requested_speed, requested_acc, requested_dir) {
            dev[unpacker_name]["catapulta_requested_dir"] = requested_dir;
            dev[unpacker_name]["catapulta_requested_speed"] = requested_speed;
            dev[unpacker_name]["catapulta_requested_acc"] = requested_acc;
            drivers.UNP_MOTOR_DRIVER_OBJ.set_speed_config(catapulta_motor_name, requested_speed, requested_acc, requested_acc, requested_dir);
            dev[unpacker_name]["catapulta_run_speed_control"] = true;
        }

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_THROW_POS, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_THROW_POS;
            },
            then: function() {
                log.info("throw_pos")
                catapulta_motor_pos_control_request(catapulta_motor_name, dev[unpacker_name]["catapulta_throw_pos"], !dev[unpacker_name]["catapulta_calib_direction"], dev[unpacker_name]["catapulta_throw_speed"], dev[unpacker_name]["catapulta_default_acc"])
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_SPEED;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_BACK_SPEED, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_SPEED, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_SPEED &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, dev[unpacker_name]["catapulta_throw_pos"]) &&
                    dev[catapulta_motor_name]["reverse"] == false
            },
            then: function() {
                dev[catapulta_motor_name]["clear_pos"] = true;
                log.info("clear_pos")
                log.info("speed_back")
                catapulta_motor_speed_control_request(catapulta_motor_name, dev[unpacker_name]["catapulta_double_speed"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_calib_direction"])
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_SPEED;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_SPEED, dev[unpacker_name]["current_step"]);

            }
        });

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_SPEED, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_SPEED &&
                    dev[catapulta_motor_name]["absolute_pos_low"] >= 400 &&
                    dev[catapulta_motor_name]["reverse"] == true
            },
            then: function() {
                log.info(dev[unpacker_name]["catapulta_absolute_pos"])
                log.info("speed_double_back")
                dev[catapulta_motor_name]["reverse"] = false;
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CHECK_DOUBLE_COUNTER;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CHECK_DOUBLE_COUNTER, dev[unpacker_name]["current_step"]);

            }
        });

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CHECK_DOUBLE_COUNTER, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CHECK_DOUBLE_COUNTER &&
                    dev[catapulta_motor_name]["absolute_pos_low"] >= 800 &&
                    dev[catapulta_motor_name]["reverse"] == false
            },
            then: function() {
                log.info(dev[unpacker_name]["catapulta_absolute_pos"])
                log.info("speed_double_counter_1")
                dev[catapulta_motor_name]["reverse"] = true;
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_HOMING_OPENED;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_HOMING_OPENED, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_HOMING_OPENED, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_HOMING_OPENED &&
                    dev[catapulta_motor_name]["absolute_pos_low"] >= 1100 &&
                    dev[catapulta_motor_name]["reverse"] == true
            },
            then: function() {
                log.info(dev[unpacker_name]["catapulta_absolute_pos"])
                log.info("speed_double_counter_2")
                dev[catapulta_motor_name]["reverse"] = false;
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_STOP_HOMING;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_STOP_HOMING, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_STOP_HOMING, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_STOP_HOMING &&
                    dev[catapulta_motor_name]["absolute_pos_low"] >= 1500 &&
                    dev[catapulta_motor_name]["reverse"] == false
            },
            then: function() {
                log.info(dev[unpacker_name]["catapulta_absolute_pos"])
                log.info("STOP")
                UNP_MODEL_FUNC.force_stop(unpacker_name, catapulta_motor_name)
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.COMPLETED, dev[unpacker_name]["current_step"]);
            }
        });
    }
};

unpacker_unpack_definition();



/*
var UNPACK_STEPS = {
    STANDBY: 0,
    RUNNING_ARM_MOTOR: 1,
    ACTUATOR_ON: 2,
    CHECK_GRIPPER_TRAY_SENSOR: 3,
    ACTUATOR_OFF: 4,
    GRIPPER_STATE_CLOSE: 5,
    ARM_RUNNING_ON_POS: 6,
    CATAPULTA_RUNNING_HIGH_POS: 7,
    VACUUM_SET_ON: 8,
    CATAPULTA_RUNNING_LOW_POS: 9,
    CATAPULTA_RUNNING_OPEN: 10,
    CATAPULTA_CHECK_OPENED: 11,
    CATAPULTA_STOP_ON_OPEN: 12,
    ARM_RUNNING_OUT_POS: 13,
    CATAPULTA_RUNNING_THROW_POS: 14,
    ARM_RUNNING_THROW_POS: 15,
    CATAPULTA_RUNNING_DOUBLE_BACK_SPEED: 16,
    CATAPULTA_RUNNING_DOUBLE_SPEED: 17,
    CHECK_DOUBLE_COUNTER: 18,
    CATAPULTA_RUNNING_HOMING_OPENED: 19,
    CHECK_OPEN_SENSOR: 20,
    CHECK_OPEN_SENSOR_OFF: 21,
    CATAPULTA_STOP_HOMING_OPENED: 22,
    CATAPULTA_RUNNING_HOMING: 23,
    CATAPULTA_CHECK_LIMIT_SENSOR: 24,
    CATAPULTA_STOP_HOMING: 25
}

var UNPACK_LOG = {
    RULE: "UNPACKER UNPACK",
    RUNNING_ARM_MOTOR: "running arm in middle pos/gripper open ",
    ACTUATOR_ON: "tray pusher on",
    CHECK_GRIPPER_TRAY_SENSOR: "check gripper sensor",
    ACTUATOR_OFF: "tray pusher off",
    GRIPPER_STATE_CLOSE: "gripper closed",
    ARM_RUNNING_ON_POS: "arm running in on pos",
    CATAPULTA_RUNNING_HIGH_POS: "catapulta running in high pos",
    VACUUM_SET_ON: "vacuum pump on",
    CATAPULTA_RUNNING_LOW_POS: "catapulta running in low pos",
    CATAPULTA_RUNNING_OPEN: "catapulta running in open in speed control",
    CATAPULTA_CHECK_OPENED: "check opened sensor",
    CATAPULTA_STOP_ON_OPEN: "catpulta stop open",
    ARM_RUNNING_OUT_POS: "arm running in out pos",
    CATAPULTA_RUNNING_THROW_POS: "catapulta running in throw pos",
    ARM_RUNNING_THROW_POS: "arm running in throw pos",
    CATAPULTA_RUNNING_DOUBLE_BACK_SPEED: "catapulta running in double back pos",
    CATAPULTA_RUNNING_DOUBLE_SPEED: "catapulta running in double pos",
    CHECK_DOUBLE_COUNTER: "check double move finished",
    CATAPULTA_RUNNING_HOMING_OPENED: "catapulta opened sensor homing",
    CHECK_OPEN_SENSOR: "check open sensor on",
    CHECK_OPEN_SENSOR_OFF: "check open sensor off",
    CATAPULTA_STOP_HOMING_OPENED: "stop first homing",
    CATAPULTA_RUNNING_HOMING: "catapulta running in homing in speed control",
    CATAPULTA_CHECK_LIMIT_SENSOR: "check limit sensor",
    CATAPULTA_STOP_HOMING: "catapulta stoped",
    COMPLETED: "unpack completed"
}

var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

function unpacker_unpack_definition() {
    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var unpacker_sensor = config.UNP_SENSOR_PREFIX + unpacker_index;
        var unpacker_actuator = config.UNP_ACTUATOR_PREFIX + unpacker_index;
        var arm_motor_name = config.UNP_ARM_MOTOR_PREFIX + unpacker_index;
        var catapulta_motor_name = config.UNP_CATAPULTA_MOTOR_PREFIX + unpacker_index;

        var catapulta_double_counter = 0;

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.ARM_RUNNING_OUT_POS, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.ARM_RUNNING_OUT_POS;
            },
            then: function() {
                catapulta_double_counter = 0;
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_THROW_POS;
            }
        });

        function catapulta_motor_pos_control_request(catapulta_motor_name, requested_pos, requested_dir, requested_speed, requested_acc) {
            dev[unpacker_name]["catapulta_requested_pos"] = requested_pos;
            dev[unpacker_name]["catapulta_requested_dir"] = requested_dir;
            dev[unpacker_name]["catapulta_requested_speed"] = requested_speed;
            dev[unpacker_name]["catapulta_requested_acc"] = requested_acc;
            drivers.UNP_MOTOR_DRIVER_OBJ.set_pos_config(catapulta_motor_name, requested_pos, requested_speed, requested_acc, requested_acc, requested_dir);
            dev[unpacker_name]["catapulta_run_pos_control"] = true;
        }

        function catapulta_motor_speed_control_request(catapulta_motor_name, requested_speed, requested_acc, requested_dir) {
            dev[unpacker_name]["catapulta_requested_dir"] = requested_dir;
            dev[unpacker_name]["catapulta_requested_speed"] = requested_speed;
            dev[unpacker_name]["catapulta_requested_acc"] = requested_acc;
            drivers.UNP_MOTOR_DRIVER_OBJ.set_speed_config(catapulta_motor_name, requested_speed, requested_acc, requested_acc, requested_dir);
            dev[unpacker_name]["catapulta_run_speed_control"] = true;
        }

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_THROW_POS, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_THROW_POS;
            },
            then: function() {
                log.info("throw_pos")
                catapulta_motor_pos_control_request(catapulta_motor_name, dev[unpacker_name]["catapulta_throw_pos"], !dev[unpacker_name]["catapulta_calib_direction"], dev[unpacker_name]["catapulta_throw_speed"], dev[unpacker_name]["catapulta_default_acc"])
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_SPEED;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_BACK_SPEED, dev[unpacker_name]["current_step"]);
            }
        });



        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_SPEED, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_SPEED &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, dev[unpacker_name]["catapulta_throw_pos"])
            },
            then: function() {
                dev[catapulta_motor_name]["clear_pos"] = true;
                log.info("clear_pos")
                log.info("back")
                catapulta_motor_speed_control_request(catapulta_motor_name, dev[unpacker_name]["catapulta_double_speed"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_calib_direction"])
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_SPEED;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_SPEED, dev[unpacker_name]["current_step"]);

            }
        });

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_SPEED, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_SPEED &&
                    dev[catapulta_motor_name]["absolute_pos_low"] >= 400
            },
            then: function() {
                log.info("double_back")
                dev[catapulta_motor_name]["reverse"] = false;
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CHECK_DOUBLE_COUNTER;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CHECK_DOUBLE_COUNTER, dev[unpacker_name]["current_step"]);

            }
        });

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CHECK_DOUBLE_COUNTER, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CHECK_DOUBLE_COUNTER &&
                    dev[catapulta_motor_name]["absolute_pos_low"] >= 800
            },
            then: function() {
                dev[catapulta_motor_name]["reverse"] = true;
            }
        });
    }
};

//______________________CORRECT_RULES____________________________//

// defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_SPEED, {
//     when: function() {
//         return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
//             dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_SPEED &&
//             drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, dev[unpacker_name]["catapulta_throw_pos"]) &&
//             dev[catapulta_motor_name]["reverse"] == false
//     },
//     then: function() {
//         dev[catapulta_motor_name]["clear_pos"] = true;
//         log.info("clear_pos")
//         log.info("back")
//         catapulta_motor_speed_control_request(catapulta_motor_name, dev[unpacker_name]["catapulta_double_speed"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_calib_direction"])
//         dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_SPEED;
//         UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_SPEED, dev[unpacker_name]["current_step"]);

//     }
// });

// defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_SPEED, {
//     when: function() {
//         return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
//             dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_SPEED &&
//             dev[catapulta_motor_name]["absolute_pos_low"] >= 400 &&
//             dev[catapulta_motor_name]["reverse"] == true
//     },
//     then: function() {
//         log.info("double_back")
//         dev[catapulta_motor_name]["reverse"] = false;
//         dev[unpacker_name]["current_step"] = UNPACK_STEPS.CHECK_DOUBLE_COUNTER;
//         UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CHECK_DOUBLE_COUNTER, dev[unpacker_name]["current_step"]);

//     }
// });

// defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CHECK_DOUBLE_COUNTER, {
//     when: function() {
//         return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
//             dev[unpacker_name]["current_step"] == UNPACK_STEPS.CHECK_DOUBLE_COUNTER &&
//             dev[catapulta_motor_name]["absolute_pos_low"] >= 800 &&
//             dev[catapulta_motor_name]["reverse"] == false
//     },
//     then: function() {
//         log.info("double_counter")
//         dev[catapulta_motor_name]["reverse"] = true;
//     }
// });

unpacker_unpack_definition();
*/