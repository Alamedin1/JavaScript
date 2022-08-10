var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });
var engine = new PersistentStorage("engine", { global: true });

var VIRTUAL_STEPS = {
    START: 0,
    SET_POS: 1,
    RUN_POS: 2,
    CLEAR_POS: 3,
    SET_SPEED: 4,
    RUN_SPEED: 5,
    FORCE_STOP: 6,
    COMPLETED: 7
}

var VIRTUAL_LOG = {
    START: "START_VIRTUAL_WB",
    SET_POS: "setting virtual position",
    RUN_POS: "run virtual in pos control",
    CLEAR_POS: "clear virtual pos",
    SET_SPEED: "setting virtual speed",
    RUN_SPEED: "run virtual in speed control",
    FORCE_STOP: "force stop",
    COMPLETED: "COMPLETED VIRTUAL MOVEMENT"
}

var VIRTUAL_POS = {
    POS_1: 100,
    POS_2: 200,
    POS_3: 110,
}


function wb_test() {
    for (var i = 1; i <= 1; i++) {
        var virtual_index = i.toString(10);
        var virtual_name = "DEVICE_" + virtual_index;
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var catapulta_motor_name = config.UNP_CATAPULTA_MOTOR_PREFIX + unpacker_index;

        defineVirtualDevice(virtual_name, {
            title: virtual_name,
            cells: {
                "engine_absolute_pos_1": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_direction_1": {
                    type: "switch",
                    readonly: false,
                    value: false
                },
                "engine_speed_1": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_dec_1": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_acc_1": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_requested_pos_1": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_requested_dir_1": {
                    type: "switch",
                    value: false
                },
                "engine_requested_speed_1": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_requested_acc_1": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_run_pos_control_1": {
                    type: "switch",
                    value: false
                },
                "engine_run_speed_control_1": {
                    type: "switch",
                    value: false
                },
                "engine_status_1": {
                    type: "text",
                    value: "initial"
                },
                "engine_absolute_pos_2": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_direction_2": {
                    type: "switch",
                    readonly: false,
                    value: false
                },
                "engine_speed_2": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_dec_2": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_acc_2": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_requested_pos_2": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_requested_dir_2": {
                    type: "switch",
                    value: false
                },
                "engine_requested_speed_2": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_requested_acc_2": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_run_pos_control_2": {
                    type: "switch",
                    value: false
                },
                "engine_run_speed_control_2": {
                    type: "switch",
                    value: false
                },
                "engine_status_2": {
                    type: "text",
                    value: "initial"
                },
                "engine_absolute_pos_3": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_direction_3": {
                    type: "switch",
                    readonly: false,
                    value: false
                },
                "engine_speed_3": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_dec_3": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_acc_3": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_requested_pos_3": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_requested_dir_3": {
                    type: "switch",
                    value: false
                },
                "engine_requested_speed_3": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_requested_acc_3": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "engine_run_pos_control_3": {
                    type: "switch",
                    value: false
                },
                "engine_run_speed_control_3": {
                    type: "switch",
                    value: false
                },
                "engine_status_3": {
                    type: "text",
                    value: "initial"
                },
                "request_id": {
                    type: "text",
                    value: ""
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
                "status": {
                    type: "text",
                    value: "initial"
                },
                "clear_pos": {
                    type: "switch",
                    value: false
                },
                "start": {
                    type: "switch",
                    value: false
                },
                "force_stop": {
                    type: "switch",
                    value: false
                }
            }
        });

        defineRule(virtual_name + "save_engine_requested_dir", {
            whenChanged: unpacker_name + "/" + "catapulta_requested_dir",
            then: function(newValue) {
                if (newValue) {
                    dev[virtual_name]["engine_requested_dir_1"] = newValue;
                    log.info("engine_requested_dir_1" + newValue);
                    dev[virtual_name]["engine_requested_dir_2"] = newValue;
                    log.info("engine_requested_dir_2" + newValue);
                    dev[virtual_name]["engine_requested_dir_3"] = newValue;
                    log.info("engine_requested_dir_3" + newValue);
                }
            }
        });

        defineRule(virtual_name + "save_engine_requested_speed", {
            whenChanged: unpacker_name + "/" + "catapulta_requested_speed",
            then: function(newValue) {
                if (newValue) {
                    dev[virtual_name]["engine_requested_speed_1"] = newValue;
                    log.info("engine_requested_speed_1" + newValue);
                    dev[virtual_name]["engine_requested_speed_2"] = newValue;
                    log.info("engine_requested_speed_2" + newValue);
                    dev[virtual_name]["engine_requested_speed_3"] = newValue;
                    log.info("engine_requested_speed_3" + newValue);
                }
            }
        });

        defineRule(virtual_name + "save_engine_requested_acc", {
            whenChanged: unpacker_name + "/" + "catapulta_requested_acc",
            then: function(newValue) {
                if (newValue) {
                    dev[virtual_name]["engine_requested_acc_1"] = newValue;
                    log.info("engine_requested_acc_1" + newValue);
                    dev[virtual_name]["engine_requested_acc_2"] = newValue;
                    log.info("engine_requested_acc_2" + newValue);
                    dev[virtual_name]["engine_requested_acc_3"] = newValue;
                    log.info("engine_requested_acc_3" + newValue);
                }
            }
        });

        defineRule(virtual_name + "start_switch", {
            whenChanged: virtual_name + "/" + "start",
            then: function() {
                dev[virtual_name]["current_step"] = VIRTUAL_STEPS.START;
                ENGINE_MODEL_FUNC.unpacker_log(virtual_name, VIRTUAL_LOG.RULE, VIRTUAL_LOG.START, dev[virtual_name]["current_step"]);
            }
        });

        defineRule(virtual_name + "start" + VIRTUAL_STEPS.START, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[virtual_name]["current_step"] == VIRTUAL_STEPS.START
            },
            then: function() {
                dev[virtual_name]["current_step"] == VIRTUAL_STEPS.SET_POS;
                ENGINE_MODEL_FUNC.unpacker_log(virtual_name, VIRTUAL_LOG.RULE, VIRTUAL_LOG.SET_POS, dev[virtual_name]["current_step"]);
            }
        });

        defineRule(virtual_name + "set_virtual" + VIRTUAL_STEPS.SET_POS, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[virtual_name]["current_step"] == VIRTUAL_STEPS.SET_POS
            },
            then: function() {
                setting_virtual_position_1(VIRTUAL_POS.POS_1, dev[virtual_name]["engine_requested_dir_1"], dev[virtual_name]["engine_requested_speed_1"], dev[virtual_name]["engine_requested_acc_1"]);
                log.info("setting virtual pos parameters_1");
                setting_virtual_position_2(VIRTUAL_POS.POS_2, dev[virtual_name]["engine_requested_dir_2"], dev[virtual_name]["engine_requested_speed_2"], dev[virtual_name]["engine_requested_acc_2"]);
                log.info("setting virtual pos parameters_2");
                setting_virtual_position_3(VIRTUAL_POS.POS_3, dev[virtual_name]["engine_requested_dir_3"], dev[virtual_name]["engine_requested_speed_3"], dev[virtual_name]["engine_requested_acc_3"]);
                log.info("setting virtual pos parameters_3");
                dev[virtual_name]["current_step"] == VIRTUAL_STEPS.RUN_POS;
                ENGINE_MODEL_FUNC.unpacker_log(virtual_name, VIRTUAL_LOG.RULE, VIRTUAL_LOG.RUN_POS, dev[virtual_name]["current_step"]);
            }
        });

        defineRule(virtual_name + "run_virtual_pos" + VIRTUAL_STEPS.RUN_POS, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[virtual_name]["current_step"] == VIRTUAL_STEPS.RUN_POS
            },
            then: function() {
                run_virtual_position(dev[virtual_name]["engine_requested_pos_1"], dev[virtual_name]["engine_absolute_pos_1"], VIRTUAL_POS.POS_1);
                log.info("run virtual in pos control_1");
                run_virtual_position(dev[virtual_name]["engine_requested_pos_2"], dev[virtual_name]["engine_absolute_pos_2"], VIRTUAL_POS.POS_2);
                log.info("run virtual in pos control_2");
                run_virtual_position(dev[virtual_name]["engine_requested_pos_3"], dev[virtual_name]["engine_absolute_pos_3"], VIRTUAL_POS.POS_3);
                log.info("run virtual in pos control_3");
                dev[virtual_name]["current_step"] == VIRTUAL_STEPS.STOP;
                ENGINE_MODEL_FUNC.unpacker_log(virtual_name, VIRTUAL_LOG.RULE, VIRTUAL_LOG.STOP, dev[virtual_name]["current_step"]);
            }
        });

        defineRule(virtual_name + "clear_pos_virtual" + VIRTUAL_STEPS.CLEAR_POS, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[virtual_name]["current_step"] == VIRTUAL_STEPS.CLEAR_POS &&
                    dev[virtual_name]["engine_absolute_pos_2"] == dev[virtual_name]["engine_requested_pos_2"]
            },
            then: function() {
                clear_position();
                dev[virtual_name]["clear_pos"] = false;
                log.info("all virtual clearing pos")
                dev[virtual_name]["current_step"] == VIRTUAL_STEPS.SET_SPEED;
                ENGINE_MODEL_FUNC.unpacker_log(virtual_name, VIRTUAL_LOG.RULE, VIRTUAL_LOG.SET_SPEED, dev[virtual_name]["current_step"]);
            }
        });

        defineRule(virtual_name + "set_speed_virtual" + VIRTUAL_STEPS.SET_SPEED, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[virtual_name]["current_step"] == VIRTUAL_STEPS.SET_SPEED &&
                    dev[virtual_name]["engine_absolute_pos_2"] == 0
            },
            then: function() {
                setting_virtual_speed_1(dev[virtual_name]["engine_requested_dir_1"], dev[virtual_name]["engine_requested_speed_1"], dev[virtual_name]["engine_requested_acc_1"]);
                log.info("setting virtual speed parameters_1");
                setting_virtual_speed_2(dev[virtual_name]["engine_requested_dir_2"], dev[virtual_name]["engine_requested_speed_2"], dev[virtual_name]["engine_requested_acc_2"]);
                log.info("setting virtual speed parameters_2");
                setting_virtual_speed_3(dev[virtual_name]["engine_requested_dir_3"], dev[virtual_name]["engine_requested_speed_3"], dev[virtual_name]["engine_requested_acc_3"]);
                log.info("setting virtual speed parameters_3");
                dev[virtual_name]["current_step"] == VIRTUAL_STEPS.RUN_SPEED;
                ENGINE_MODEL_FUNC.unpacker_log(virtual_name, VIRTUAL_LOG.RULE, VIRTUAL_LOG.RUN_SPEED, dev[virtual_name]["current_step"]);
            }
        });

        defineRule(virtual_name + "run_speed_virtual" + VIRTUAL_STEPS.RUN_SPEED, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[virtual_name]["current_step"] == VIRTUAL_STEPS.RUN_SPEED
            },
            then: function() {
                dev[virtual_name]["engine_absolute_pos_1"] = dev[unpacker_name]["catapulta_absolute_pos"];
                dev[virtual_name]["engine_absolute_pos_2"] = dev[unpacker_name]["catapulta_absolute_pos"];
                dev[virtual_name]["engine_absolute_pos_3"] = dev[unpacker_name]["catapulta_absolute_pos"];
                dev[virtual_name]["current_step"] == VIRTUAL_STEPS.FORCE_STOP;
                ENGINE_MODEL_FUNC.unpacker_log(virtual_name, VIRTUAL_LOG.RULE, VIRTUAL_LOG.FORCE_STOP, dev[virtual_name]["current_step"]);
            }
        });

        defineRule(virtual_name + "force_stop_virtual" + VIRTUAL_STEPS.FORCE_STOP, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[virtual_name]["current_step"] == VIRTUAL_STEPS.FORCE_STOP
            },
            then: function() {
                force_stop();
                dev[virtual_name]["force_stop"] = false;
                dev[virtual_name]["clear_pos"] = false;
                dev[virtual_name]["current_step"] == VIRTUAL_STEPS.COMPLETED;
                ENGINE_MODEL_FUNC.unpacker_log(virtual_name, VIRTUAL_LOG.RULE, VIRTUAL_LOG.COMPLETED, dev[virtual_name]["current_step"]);
            }
        });

        defineRule(virtual_name + "completed_virtual" + VIRTUAL_STEPS.COMPLETED, {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.ENGINE_RULES.UNPACK &&
                    dev[virtual_name]["current_step"] == VIRTUAL_STEPS.COMPLETED &&
                    dev[virtual_name]["force_stop"] == false
            },
            then: function() {
                dev[virtual_name]["current_step"] == VIRTUAL_STEPS.COMPLETED;
                ENGINE_MODEL_FUNC.unpacker_log(virtual_name, VIRTUAL_LOG.RULE, VIRTUAL_LOG.COMPLETED, dev[virtual_name]["current_step"]);
            }
        });
    }
}

function setting_virtual_position_1(requested_pos, requested_dir, requested_speed, requested_acc) {
    dev[virtual_name]["engine_requested_pos_1"] = requested_pos;
    dev[virtual_name]["engine_direction_1"] = requested_dir;
    dev[virtual_name]["engine_speed_1"] = requested_speed;
    dev[virtual_name]["engine_acc_1"] = requested_acc;
    dev[virtual_name]["engine_dec_1"] = requested_acc;
    dev[virtual_name]["engine_run_pos_control_1"] = true;
}

function setting_virtual_position_2(requested_pos, requested_dir, requested_speed, requested_acc) {
    dev[virtual_name]["engine_requested_pos_2"] = requested_pos;
    dev[virtual_name]["engine_direction_2"] = requested_dir;
    dev[virtual_name]["engine_speed_2"] = requested_speed;
    dev[virtual_name]["engine_acc_2"] = requested_acc;
    dev[virtual_name]["engine_dec_2"] = requested_acc;
    dev[virtual_name]["engine_run_pos_control_2"] = true;
}

function setting_virtual_position_3(requested_pos, requested_dir, requested_speed, requested_acc) {
    dev[virtual_name]["engine_requested_pos_3"] = requested_pos;
    dev[virtual_name]["engine_direction_3"] = requested_dir;
    dev[virtual_name]["engine_speed_3"] = requested_speed;
    dev[virtual_name]["engine_acc_3"] = requested_acc;
    dev[virtual_name]["engine_dec_3"] = requested_acc;
    dev[virtual_name]["engine_run_pos_control_3"] = true;
}

function run_virtual_position(requested_pos, absulute_pos, virtual_pos) {
    if (requested_pos == virtual_pos) {
        absulute_pos++
        if (absulute_pos == requested_pos) {
            return false
        }
    }
    return false
}

function clear_position() {
    dev[virtual_name]["clear_pos"] = true;
    dev[virtual_name]["engine_absolute_pos_1"] = 0;
    dev[virtual_name]["engine_direction_1"] = 0;
    dev[virtual_name]["engine_speed_1"] = 0;
    dev[virtual_name]["engine_acc_1"] = 0;
    dev[virtual_name]["engine_dec_1"] = 0;
    dev[virtual_name]["engine_run_pos_control_1"] = false;
    dev[virtual_name]["engine_absolute_pos_2"] = 0;
    dev[virtual_name]["engine_direction_2"] = 0;
    dev[virtual_name]["engine_speed_2"] = 0;
    dev[virtual_name]["engine_acc_2"] = 0;
    dev[virtual_name]["engine_dec_2"] = 0;
    dev[virtual_name]["engine_run_pos_control_2"] = false;
    dev[virtual_name]["engine_absolute_pos_3"] = 0;
    dev[virtual_name]["engine_direction_3"] = 0;
    dev[virtual_name]["engine_speed_3"] = 0;
    dev[virtual_name]["engine_acc_3"] = 0;
    dev[virtual_name]["engine_dec_3"] = 0;
    dev[virtual_name]["engine_run_pos_control_3"] = false;

}

function setting_virtual_speed_1(requested_dir, requested_speed, requested_acc) {
    dev[virtual_name]["engine_direction_1"] = requested_dir;
    dev[virtual_name]["engine_speed_1"] = requested_speed;
    dev[virtual_name]["engine_acc_1"] = requested_acc;
    dev[virtual_name]["engine_dec_1"] = requested_acc;
    dev[virtual_name]["engine_run_speed_control_1"] = true;
}

function setting_virtual_speed_2(requested_dir, requested_speed, requested_acc) {
    dev[virtual_name]["engine_direction_2"] = requested_dir;
    dev[virtual_name]["engine_speed_2"] = requested_speed;
    dev[virtual_name]["engine_acc_2"] = requested_acc;
    dev[virtual_name]["engine_dec_2"] = requested_acc;
    dev[virtual_name]["engine_run_speed_control_2"] = true;
}

function setting_virtual_speed_3(requested_dir, requested_speed, requested_acc) {
    dev[virtual_name]["engine_direction_3"] = requested_dir;
    dev[virtual_name]["engine_speed_3"] = requested_speed;
    dev[virtual_name]["engine_acc_3"] = requested_acc;
    dev[virtual_name]["engine_dec_3"] = requested_acc;
    dev[virtual_name]["engine_run_speed_control_3"] = true;
}

function force_stop() {
    clear_position();
    log.info("clear position");
    dev[virtual_name]["force_stop"] = true;
    log.info("FORCE STOP / all registers null")
}

wb_test();