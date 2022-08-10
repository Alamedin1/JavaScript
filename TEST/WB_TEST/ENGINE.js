var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });
var engine = new PersistentStorage("engine", { global: true });
config.ENGINE_RULES = new StorableObject({
    EMPTY: 0,
    UNPACK: 1,
    ARM_CALIB: 2,
    BUFFER_CALIB: 3,
    BUFFER_SET_OFFSET: 4
});

global.__proto__.ENGINE_MODEL_FUNC = {
    catapulta_motor_pos_control_request: catapulta_motor_pos_control_request,
    catapulta_motor_speed_control_request: catapulta_motor_speed_control_request,
    unpacker_log: unpacker_log,
    set_default_ready_state: set_default_ready_state,
    force_stop: force_stop
}

var ENGINE_STEPS = {
    STANDBY: 0,
    ENGINE_POS_1: 1,
    ENGINE_POS_2: 2,
    ENGINE_POS_3: 3,
    ENGINE_POS_4: 4,
    ENGINE_SPEED: 5,
    ENGINE_REVERSE_1: 6,
    ENGINE_REVERSE_2: 7,
    COMPLETED: 8
}

var ENGINE_LOG = {
    RULE: "ENGINE_MOVEMENT",
    ENGINE_POS_1: "POSITION_1 10000",
    ENGINE_POS_2: "POSITION_1 5000",
    ENGINE_POS_3: "POSITION_1 7500",
    ENGINE_POS_4: "POSITION_1 20500",
    ENGINE_SPEED: "SET_SPEED",
    ENGINE_REVERSE_1: "REVERSE_1",
    ENGINE_REVERSE_2: "REVERSE_2",
    COMPLETED: "COMPLETED_GO_TO_BEGINNING"
}

function unpacker_engine_definition() {
    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var catapulta_motor_name = config.UNP_CATAPULTA_MOTOR_PREFIX + unpacker_index;

        defineVirtualDevice(unpacker_name, {
            title: unpacker_name,
            cells: {
                "catapulta_absolute_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_calib_direction": {
                    type: "switch",
                    readonly: false,
                    value: false
                },
                "catapulta_emergency_dec": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_default_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_low_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_open_low_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_high_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_open_high_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_open_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_throw_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_throw_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_double_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_double_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_double_count": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_requested_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_requested_dir": {
                    type: "switch",
                    value: false
                },
                "catapulta_requested_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_requested_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_run_pos_control": {
                    type: "switch",
                    value: false
                },
                "catapulta_run_speed_control": {
                    type: "switch",
                    value: false
                },
                "status": {
                    type: "text",
                    value: "initial"
                },
                "current_rule": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "current_step": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "force_stop": {
                    type: "switch",
                    value: false
                }
            }
        });


        defineRule(unpacker_name + "force_stop", {
            when: function() {
                return dev[unpacker_name]["force_stop"];
            },
            then: function() {
                dev[unpacker_name]["force_stop"] = false;
                force_stop(unpacker_name, catapulta_motor_name);
            }
        });

        defineRule(unpacker_name + "catapulta_run_pos_control", {
            when: function() {
                return dev[unpacker_name]["catapulta_run_pos_control"] &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_pos_config(catapulta_motor_name, dev[unpacker_name]["catapulta_requested_pos"], dev[unpacker_name]["catapulta_requested_speed"], dev[unpacker_name]["catapulta_requested_acc"], dev[unpacker_name]["catapulta_requested_acc"], dev[unpacker_name]["catapulta_requested_dir"]);
            },
            then: function() {
                drivers.UNP_MOTOR_DRIVER_OBJ.run_pos_config(catapulta_motor_name);
                dev[unpacker_name]["catapulta_run_pos_control"] = false;
            }
        });

        defineRule(unpacker_name + "catapulta_run_speed_control", {
            when: function() {
                return dev[unpacker_name]["catapulta_run_speed_control"] &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_speed_config(catapulta_motor_name, dev[unpacker_name]["catapulta_requested_speed"], dev[unpacker_name]["catapulta_requested_acc"], dev[unpacker_name]["catapulta_requested_acc"], dev[unpacker_name]["catapulta_requested_dir"]);
            },
            then: function() {
                drivers.UNP_MOTOR_DRIVER_OBJ.run_speed_config(catapulta_motor_name);
                dev[unpacker_name]["catapulta_run_speed_control"] = false;
            }
        });

        defineRule(unpacker_name + "_engine_" + ENGINE_STEPS.STANDBY, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == ENGINE_STEPS.STANDBY;
            },
            then: function() {
                log.info("go to step_pos_1")
                dev[unpacker_name]["current_step"] = ENGINE_STEPS.ENGINE_POS_1;
                ENGINE_MODEL_FUNC.unpacker_log(unpacker_name, ENGINE_LOG.RULE, ENGINE_LOG.ENGINE_POS_1, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_engine_" + ENGINE_STEPS.ENGINE_POS_1, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == ENGINE_STEPS.ENGINE_POS_1;
            },
            then: function() {
                ENGINE_MODEL_FUNC.catapulta_motor_pos_control_request(unpacker_name, catapulta_motor_name, dev[unpacker_name]["catapulta_requested_pos"], !dev[unpacker_name]["catapulta_requested_dir"], dev[unpacker_name]["catapulta_requested_speed"], dev[unpacker_name]["catapulta_requested_acc"])
                log.info("catapulta_motor_pos_control_1")
                engine.engine_pos_2 = dev[unpacker_name]["catapulta_requested_pos"] - 5000;
                engine.engine_pos_3 = dev[unpacker_name]["catapulta_requested_pos"] - 2500;
                engine.engine_pos_4 = dev[unpacker_name]["catapulta_requested_pos"] + 10500;
                dev[unpacker_name]["current_step"] = ENGINE_STEPS.ENGINE_POS_2;
                ENGINE_MODEL_FUNC.unpacker_log(unpacker_name, ENGINE_LOG.RULE, ENGINE_LOG.ENGINE_POS_2, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_engine_" + ENGINE_STEPS.ENGINE_POS_2, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == ENGINE_STEPS.ENGINE_POS_2 &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, dev[unpacker_name]["catapulta_requested_pos"])
            },
            then: function() {
                log.info(engine.engine_pos_2);
                ENGINE_MODEL_FUNC.catapulta_motor_pos_control_request(unpacker_name, catapulta_motor_name, engine.engine_pos_2, !dev[unpacker_name]["catapulta_requested_dir"], dev[unpacker_name]["catapulta_requested_speed"], dev[unpacker_name]["catapulta_requested_acc"])
                log.info("catapulta_motor_pos_control_2")
                dev[unpacker_name]["current_step"] = ENGINE_STEPS.ENGINE_POS_3;
                ENGINE_MODEL_FUNC.unpacker_log(unpacker_name, ENGINE_LOG.RULE, ENGINE_LOG.ENGINE_POS_3, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_engine_" + ENGINE_STEPS.ENGINE_POS_3, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == ENGINE_STEPS.ENGINE_POS_3 &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, engine.engine_pos_2)
            },
            then: function() {
                log.info(engine.engine_pos_3);
                ENGINE_MODEL_FUNC.catapulta_motor_pos_control_request(unpacker_name, catapulta_motor_name, engine.engine_pos_3, !dev[unpacker_name]["catapulta_requested_dir"], dev[unpacker_name]["catapulta_requested_speed"], dev[unpacker_name]["catapulta_requested_acc"])
                log.info("catapulta_motor_pos_control_3")
                dev[unpacker_name]["current_step"] = ENGINE_STEPS.ENGINE_POS_4;
                ENGINE_MODEL_FUNC.unpacker_log(unpacker_name, ENGINE_LOG.RULE, ENGINE_LOG.ENGINE_POS_4, dev[unpacker_name]["current_step"]);

            }
        });

        defineRule(unpacker_name + "_engine_" + ENGINE_STEPS.ENGINE_POS_4, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == ENGINE_STEPS.ENGINE_POS_4 &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, engine.engine_pos_3)
            },
            then: function() {
                log.info(engine.engine_pos_4);
                ENGINE_MODEL_FUNC.catapulta_motor_pos_control_request(unpacker_name, catapulta_motor_name, engine.engine_pos_4, !dev[unpacker_name]["catapulta_requested_dir"], dev[unpacker_name]["catapulta_requested_speed"], dev[unpacker_name]["catapulta_requested_acc"])
                log.info("catapulta_motor_pos_control_4")
                dev[unpacker_name]["current_step"] = ENGINE_STEPS.ENGINE_SPEED;
                ENGINE_MODEL_FUNC.unpacker_log(unpacker_name, ENGINE_LOG.RULE, ENGINE_LOG.ENGINE_SPEED, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_engine_" + ENGINE_STEPS.ENGINE_SPEED, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == ENGINE_STEPS.ENGINE_SPEED &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.pos_control_completed(catapulta_motor_name, engine.engine_pos_4)
            },
            then: function() {
                drivers.UNP_MOTOR_DRIVER_OBJ.clear_position(catapulta_motor_name)
                log.info("clear_pos")
                log.info("back_speed")
                ENGINE_MODEL_FUNC.catapulta_motor_speed_control_request(unpacker_name, catapulta_motor_name, dev[unpacker_name]["catapulta_requested_dir"], dev[unpacker_name]["catapulta_requested_speed"], dev[unpacker_name]["catapulta_requested_acc"])
                dev[unpacker_name]["current_step"] = ENGINE_STEPS.ENGINE_REVERSE_1;
                ENGINE_MODEL_FUNC.unpacker_log(unpacker_name, ENGINE_LOG.RULE, ENGINE_LOG.ENGINE_REVERSE_1, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_engine_" + ENGINE_STEPS.ENGINE_REVERSE_1, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == ENGINE_STEPS.ENGINE_REVERSE_1 &&
                    dev[catapulta_motor_name]["absolute_pos_low"] >= 5000 &&
                    dev[catapulta_motor_name]["reverse"] == true
            },
            then: function() {
                log.info("speed_first_change_direction_in_speed_control")
                dev[catapulta_motor_name]["reverse"] = false;
                dev[unpacker_name]["current_step"] = ENGINE_STEPS.ENGINE_REVERSE_2;
                ENGINE_MODEL_FUNC.unpacker_log(unpacker_name, ENGINE_STEPS.RULE, ENGINE_STEPS.ENGINE_REVERSE_2, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_engine_" + ENGINE_STEPS.ENGINE_REVERSE_2, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == ENGINE_STEPS.ENGINE_REVERSE_2 &&
                    dev[catapulta_motor_name]["absolute_pos_low"] >= 10000 &&
                    dev[catapulta_motor_name]["reverse"] == false
            },
            then: function() {
                log.info("speed_twice_change_direction_in_speed_control")
                dev[catapulta_motor_name]["reverse"] = true;
                dev[unpacker_name]["current_step"] = ENGINE_STEPS.COMPLETED;
                ENGINE_MODEL_FUNC.unpacker_log(unpacker_name, ENGINE_STEPS.RULE, ENGINE_STEPS.COMPLETED, dev[unpacker_name]["current_step"]);
            }
        });

        defineRule(unpacker_name + "_engine_" + ENGINE_STEPS.COMPLETED, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[unpacker_name]["current_step"] == ENGINE_STEPS.COMPLETED &&
                    dev[catapulta_motor_name]["absolute_pos_low"] >= 15000 &&
                    dev[catapulta_motor_name]["reverse"] == true
            },
            then: function() {
                drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(catapulta_motor_name, dev[unpacker_name]["catapulta_emergency_dec"]);
                log.info("emergency_stop!")
                drivers.UNP_MOTOR_DRIVER_OBJ.clear_position(catapulta_motor_name);
                log.info("clearing position")
                dev[unpacker_name]["current_step"] = ENGINE_STEPS.STANDBY;
                ENGINE_MODEL_FUNC.unpacker_log(unpacker_name, ENGINE_STEPS.RULE, ENGINE_STEPS.STANDBY, dev[unpacker_name]["current_step"]);
            }
        });
    }
};


function unpacker_log(unpacker_name, rule, log, step_id) {
    dev[unpacker_name]["status"] = " RULE: \"" + rule + "\"\nSTEP: \"" + log + "\"\n STEP_ID: \"" + step_id + "\"";
}

function set_default_ready_state(unpacker_name) {
    dev[unpacker_name]["buffer_current_rule"] = config.ENGINE_RULES.EMPTY;
    dev[unpacker_name]["buffer_current_step"] = config.ENGINE_RULES.EMPTY;
    dev[unpacker_name]["current_rule"] = config.ENGINE_RULES.EMPTY;
    dev[unpacker_name]["current_step"] = config.ENGINE_RULES.EMPTY;
}

function force_stop(unpacker_name, catapulta_motor_name) {
    drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(catapulta_motor_name, dev[unpacker_name]["catapulta_emergency_dec"]);
    dev[unpacker_name]["current_rule"] = config.ENGINE_RULES.EMPTY;
    dev[unpacker_name]["current_step"] = config.ENGINE_RULES.EMPTY;
    dev[unpacker_name]["status"] = "force_stoped";
}

function catapulta_motor_pos_control_request(unpacker_name, catapulta_motor_name, requested_pos, requested_dir, requested_speed, requested_acc) {
    drivers.UNP_MOTOR_DRIVER_OBJ.set_pos_config(catapulta_motor_name, requested_pos, requested_speed, requested_acc, requested_acc, requested_dir)
    dev[unpacker_name]["catapulta_requested_pos"] = requested_pos;
    dev[unpacker_name]["catapulta_requested_dir"] = requested_dir;
    dev[unpacker_name]["catapulta_requested_speed"] = requested_speed;
    dev[unpacker_name]["catapulta_requested_acc"] = requested_acc;
    dev[unpacker_name]["catapulta_run_pos_control"] = true;
}

function catapulta_motor_speed_control_request(unpacker_name, catapulta_motor_name, requested_dir, requested_speed, requested_acc) {
    drivers.UNP_MOTOR_DRIVER_OBJ.set_speed_config(catapulta_motor_name, requested_speed, requested_acc, requested_acc, requested_dir)
    dev[unpacker_name]["catapulta_requested_dir"] = requested_dir;
    dev[unpacker_name]["catapulta_requested_speed"] = requested_speed;
    dev[unpacker_name]["catapulta_requested_acc"] = requested_acc;
    dev[unpacker_name]["catapulta_run_speed_control"] = true;
}

unpacker_engine_definition();