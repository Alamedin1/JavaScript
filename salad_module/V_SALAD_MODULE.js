global.__proto__.MOD_MODEL_FUNC = {
    force_stop: force_stop,
    set_default_ready_state: set_default_ready_state,
    log: log,
}

global.__proto__.MOD_RULES = {
    EMPTY: 0,
    OPEN: 1,
    CLOSE: 2,
}

function mod_definition() {
    global.__proto__.MOD_MOTOR_DRIVER_OBJ = EPR60_DRIVER;

    for (var i = 1; i <= NUMBER_OF_UNPACKERS; i++) {
        var mod_index = i.toString(10);
        var mod_name = MOD_PREFIX + mod_index;
        var motor_name = MOD_MOTOR_PREFIX + mod_index;
        defineVirtualDevice(mod_name, {
            title: mod_name,
            cells: {
                "request_id": {
                    type: "range",
                    value: 0
                },
                "current_rule": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "current_step": {
                    type: "value",
                    value: 0
                },
                "timer_off_flag": {
                    type: "switch",
                    value: false
                },
                "force_stop": {
                    type: "switch",
                    value: false
                },
                "status": {
                    type: "text",
                    value: "initial"
                },
                "closed_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "calib_reverse": {
                    type: "switch",
                    readonly: false,
                    value: false
                },
                "requested_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "default_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "default_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "default_emergency_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "limit_sensor": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "plate_sensor": {
                    type: "value",
                    readonly: false,
                    value: 0
                }
            }
        });

        dev[mod_name]["status"] = "initial";
        dev[mod_name]["requested_rule"] = MOD_RULES.EMPTY;
        dev[mod_name]["current_rule"] = MOD_RULES.EMPTY;
        dev[mod_name]["current_step"] = MOD_RULES.EMPTY;

        defineRule(mod_name + "force_stop", {
            when: function() {
                return dev[mod_name]["force_stop"];
            },
            then: function() {
                dev[mod_name]["force_stop"] = false;
                force_stop(mod_name, motor_name);
            }
        });
    }
}

function force_stop(mod_name, motor_name) {
    if (dev[mod_name]["current_rule"] != MOD_RULES.EMPTY) {
        dev[mod_name]["timer_off_flag"] = true;
    }
    MOD_MOTOR_DRIVER_OBJ.emergency_stop(motor_name, dev[mod_name]["default_emergency_acc"]);
    dev[mod_name]["current_rule"] = MOD_RULES.EMPTY;
    dev[mod_name]["current_step"] = MOD_RULES.EMPTY;
    dev[mod_name]["status"] = "force_stoped";
}

function set_default_ready_state(mod_name) {
    dev[mod_name]["current_rule"] = MOD_RULES.EMPTY;
    dev[mod_name]["current_step"] = MOD_RULES.EMPTY;
    dev[mod_name]["force_stop"] = false;
}

function log(mod_name, rule, log, step_id) {
    dev[mod_name]["status"] = "MODULE RULE: \"" + rule + "\"\nSTEP: \"" + log + "\"\n STEP_ID: \"" + step_id + "\"";
}

mod_definition();