var STEP_MOTOR_CONTROL = {
    STANDBY: 0,
    RUNNING: 1
}

var LOG_MOTOR_CONTROL = {
    RULE: "DEBUG POS MOVE",
    RUNNING: "running motor",
    COMPLETED: "position completed",
}

function mod_ui_move_definition() {
    for (var i = 1; i <= NUMBER_OF_UNPACKERS; i++) {
        var mod_index = i.toString(10);
        var ui_name = MOD_UI_PREFIX + "move_" + mod_index;
        var mod_name = MOD_PREFIX + mod_index;
        var motor_name = MOD_MOTOR_PREFIX + mod_index;

        defineVirtualDevice(ui_name, {
            title: ui_name,
            cells: {
                "abs_pos": {
                    type: "value",
                    readonly: true,
                    value: 0
                },
                "debug_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "debug_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "debug_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "debug_reverse": {
                    type: "switch",
                    value: false
                },
                "speed_control": {
                    type: "switch",
                    value: false
                },
                "start": {
                    type: "switch",
                    value: false
                }
            }
        });

        defineRule(ui_name + "start", {
            when: function() {
                return dev[ui_name]["start"];
            },
            then: function() {
                dev[ui_name]["start"] = false;
                if (dev[mod_name]["current_step"] == STEP_MOTOR_CONTROL.STANDBY) {

                    dev[mod_name]["current_step"] = STEP_MOTOR_CONTROL.RUNNING;
                    MOD_MODEL_FUNC.log(mod_name, mod_index, LOG_MOTOR_CONTROL.RULE, LOG_MOTOR_CONTROL.RUNNING, dev[mod_name]["current_step"]);

                    cycle_timer = setInterval(function() {
                        if (dev[mod_name]["timer_off_flag"]) {
                            clearInterval(cycle_timer);
                            dev[mod_name]["timer_off_flag"] = false;
                        }
                        if (dev[ui_name]["speed_control"] == false) {
                            if (MOD_MOTOR_DRIVER_OBJ.move_to_pos(motor_name, dev[ui_name]["debug_pos"], dev[ui_name]["debug_speed"], dev[ui_name]["debug_acc"], dev[ui_name]["debug_acc"], dev[ui_name]["debug_reverse"])) {
                                clearInterval(cycle_timer);
                                MOD_MODEL_FUNC.set_default_ready_state(mod_name);
                                MOD_MODEL_FUNC.log(mod_name, mod_index, LOG_MOTOR_CONTROL.RULE, LOG_MOTOR_CONTROL.COMPLETED, dev[mod_name]["current_step"]);

                            }
                        } else {
                            if (MOD_MOTOR_DRIVER_OBJ.move_speed_config(motor_name, dev[ui_name]["debug_speed"], dev[ui_name]["debug_acc"], dev[ui_name]["debug_acc"], dev[ui_name]["debug_reverse"])) {
                                clearInterval(cycle_timer);
                            }
                        }
                    }, CYCLE_INTERVAL);
                }
            }
        });

        defineRule(ui_name + "get_pos", {
            whenChanged: function() {
                return MOD_MOTOR_DRIVER_OBJ.get_pos(motor_name);
            },
            then: function(newValue) {
                dev[ui_name]["abs_pos"] = newValue;
            }
        });

        dev[ui_name]["start"] = false;
        dev[mod_name]["status"] = "initial";
        dev[mod_name]["current_step"] = STEP_MOTOR_CONTROL.STANDBY;
    }
}

mod_ui_move_definition();