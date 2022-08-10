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
    CATAPULTA_RUNNING_DOUBLE_BACK_POS: 16,
    CATAPULTA_RUNNING_DOUBLE_POS: 17,
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
    CATAPULTA_RUNNING_DOUBLE_BACK_POS: "catapulta running in double back pos",
    CATAPULTA_RUNNING_DOUBLE_POS: "catapulta running in double pos",
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

        var unpacker_db = new PersistentStorage(unpacker_name, { global: true });
        unpacker_db["catapulta_throw_pos"] = 9300;
        unpacker_db["catapulta_throw_speed"] = 300;
        unpacker_db["catapulta_calib_direction"] = false;
        unpacker_db["catapulta_default_acc"] = 12;
        unpacker_db["catapulta_double_pos"] = 8900;
        unpacker_db["catapulta_double_speed"] = 500;

        function catapulta_motor_pos_control_request(catapulta_motor_name, requested_pos, requested_dir, requested_speed, requested_acc) {
            // dev[unpacker_name]["catapulta_requested_pos"] = requested_pos;
            // dev[unpacker_name]["catapulta_requested_dir"] = requested_dir;
            // dev[unpacker_name]["catapulta_requested_speed"] = requested_speed;
            // dev[unpacker_name]["catapulta_requested_acc"] = requested_acc;

            // drivers.UNP_MOTOR_DRIVER_OBJ.set_pos_config(catapulta_motor_name, dev[unpacker_name]["catapulta_requested_pos"], dev[unpacker_name]["catapulta_requested_speed"], dev[unpacker_name]["catapulta_requested_acc"], dev[unpacker_name]["catapulta_requested_acc"], dev[unpacker_name]["catapulta_requested_dir"]);
            // dev[unpacker_name]["catapulta_run_pos_control"] = true;
            unpacker_db["catapulta_requested_pos"] = requested_pos;
            unpacker_db["catapulta_requested_dir"] = requested_dir;
            unpacker_db["catapulta_requested_speed"] = requested_speed;
            unpacker_db["catapulta_requested_acc"] = requested_acc;

            drivers.UNP_MOTOR_DRIVER_OBJ.set_pos_config(catapulta_motor_name, requested_pos, requested_speed, requested_acc, requested_acc, requested_dir);
            unpacker_db["catapulta_run_pos_control"] = true;
        }

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_THROW_POS, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_THROW_POS;
            },
            then: function() {
                catapulta_motor_pos_control_request(catapulta_motor_name, unpacker_db["catapulta_throw_pos"], !unpacker_db["catapulta_calib_direction"], unpacker_db["catapulta_throw_speed"], unpacker_db["catapulta_default_acc"])
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_POS;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_BACK_POS, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_POS, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_POS &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, unpacker_db["catapulta_throw_pos"]);
            },
            then: function() {
                log.info("back")
                catapulta_motor_pos_control_request(catapulta_motor_name, unpacker_db["catapulta_double_pos"], !unpacker_db["catapulta_calib_direction"], unpacker_db["catapulta_double_speed"], unpacker_db["catapulta_default_acc"])
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_POS;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_POS, dev[unpacker_name]["current_step"]);

            }
        });

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_POS, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_POS &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, unpacker_db["catapulta_double_pos"]);
            },
            then: function() {
                log.info("trip")
                catapulta_motor_pos_control_request(catapulta_motor_name, unpacker_db["catapulta_throw_pos"], !unpacker_db["catapulta_calib_direction"], unpacker_db["catapulta_double_speed"], unpacker_db["catapulta_default_acc"])
                dev[unpacker_name]["current_step"] = UNPACK_STEPS.CHECK_DOUBLE_COUNTER;
                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CHECK_DOUBLE_COUNTER, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CHECK_DOUBLE_COUNTER, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == UNPACK_STEPS.CHECK_DOUBLE_COUNTER &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, unpacker_db["catapulta_throw_pos"]);
            },
            then: function() {
                if (catapulta_double_counter == 0) {
                    drivers.UNP_ACTUATOR_DRIVER_OBJ.set_gripper_state(unpacker_actuator, false);
                }
                catapulta_double_counter++;
                log.info("shot ", catapulta_double_counter);
                if (catapulta_double_counter == dev[unpacker_name]["catapulta_double_count"]) {
                    // dev[unpacker_name]["arm_requested_pos"] = dev[unpacker_name]["arm_out_pos"];
                    // drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(arm_motor_name, dev[unpacker_name]["arm_requested_pos"], dev[unpacker_name]["arm_default_speed"], dev[unpacker_name]["arm_default_acc"], dev[unpacker_name]["arm_default_acc"], !dev[unpacker_name]["arm_calib_direction"]);
                    log.info("done");
                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_HOMING_OPENED, dev[unpacker_name]["current_step"]);
                } else {
                    dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_POS;
                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_BACK_POS, dev[unpacker_name]["current_step"]);
                }
            }
        });

        // defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_THROW_POS, {
        //     when: function() {
        //         return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
        //             dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_THROW_POS;
        //     },
        //     then: function() {
        //         UNP_MODEL_FUNC.catapulta_motor_pos_control_request(unpacker_name, catapulta_motor_name, dev[unpacker_name]["catapulta_throw_pos"], !dev[unpacker_name]["catapulta_calib_direction"], dev[unpacker_name]["catapulta_throw_speed"], dev[unpacker_name]["catapulta_default_acc"])
        //         dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_POS;
        //         UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_BACK_POS, dev[unpacker_name]["current_step"]);
        //     }
        // });

        // defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_POS, {
        //     when: function() {
        //         return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
        //             dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_POS &&
        //             drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, dev[unpacker_name]["catapulta_throw_pos"]);
        //     },
        //     then: function() {
        //         log.info("back")
        //         UNP_MODEL_FUNC.catapulta_motor_pos_control_request(unpacker_name, catapulta_motor_name, dev[unpacker_name]["catapulta_double_pos"], !dev[unpacker_name]["catapulta_calib_direction"], dev[unpacker_name]["catapulta_double_speed"], dev[unpacker_name]["catapulta_default_acc"])
        //         dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_POS;
        //         UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_POS, dev[unpacker_name]["current_step"]);

        //     }
        // });

        // defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_POS, {
        //     when: function() {
        //         return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
        //             dev[unpacker_name]["current_step"] == UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_POS &&
        //             drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, dev[unpacker_name]["catapulta_double_pos"]);
        //     },
        //     then: function() {
        //         log.info("trip")
        //         UNP_MODEL_FUNC.catapulta_motor_pos_control_request(unpacker_name, catapulta_motor_name, dev[unpacker_name]["catapulta_throw_pos"], !dev[unpacker_name]["catapulta_calib_direction"], dev[unpacker_name]["catapulta_double_speed"], dev[unpacker_name]["catapulta_default_acc"])
        //         dev[unpacker_name]["current_step"] = UNPACK_STEPS.CHECK_DOUBLE_COUNTER;
        //         UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CHECK_DOUBLE_COUNTER, dev[unpacker_name]["current_step"]);
        //     }
        // });

        // defineRule(unpacker_name + "_unpack_" + UNPACK_STEPS.CHECK_DOUBLE_COUNTER, {
        //     when: function() {
        //         return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK &&
        //             dev[unpacker_name]["current_step"] == UNPACK_STEPS.CHECK_DOUBLE_COUNTER &&
        //             drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, dev[unpacker_name]["catapulta_throw_pos"]);
        //     },
        //     then: function() {
        //         if (catapulta_double_counter == 0) {
        //             drivers.UNP_ACTUATOR_DRIVER_OBJ.set_gripper_state(unpacker_actuator, false);
        //         }
        //         catapulta_double_counter++;
        //         log.info("shot ", catapulta_double_counter);
        //         if (catapulta_double_counter == dev[unpacker_name]["catapulta_double_count"]) {
        //             // dev[unpacker_name]["arm_requested_pos"] = dev[unpacker_name]["arm_out_pos"];
        //             // drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(arm_motor_name, dev[unpacker_name]["arm_requested_pos"], dev[unpacker_name]["arm_default_speed"], dev[unpacker_name]["arm_default_acc"], dev[unpacker_name]["arm_default_acc"], !dev[unpacker_name]["arm_calib_direction"]);
        //             log.info("done");
        //             UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_HOMING_OPENED, dev[unpacker_name]["current_step"]);
        //         } else {
        //             dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_POS;
        //             UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_BACK_POS, dev[unpacker_name]["current_step"]);
        //         }
        //     }
        // });
    }
};

unpacker_unpack_definition();