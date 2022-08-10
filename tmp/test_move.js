defineVirtualDevice("test_move", {
    title: "test_move",
    cells: {
        "start": {
            type: "switch",
            value: false
        },
        "force_flag": {
            type: "switch",
            value: false
        },
        "stop": {
            type: "switch",
            value: false
        },
        "current_step": {
            type: "value",
            value: 0
        },
        "current_epoch": {
            type: "value",
            value: 0
        }
    }
});

var epoch_number = 10;
var upper_pos = 27000;
var lower_pos = 0;

var CONTROL_STEPS = {
    STANDBY: 0,
    SET_CONFIG: 1,
    RUN: 2,
    CHECK_RUNNING: 3,
    CHECK_POS: 4,
    SET_CONFIG_BACK: 5,
    RUN_BACK: 6,
    CHECK_RUNNING_BACK: 7,
    CHECK_POS_BACK: 8,
    READY: 9
}


var LOG_POS_CONTROL = {
    RULE: "DEBUG POS MOVE",
    SET_CONFIG: "setting config for position mode",
    RUN: "running in position mode",
    CHECK_POS: "check position",
    READY: "move completed"
}

defineRule("test_move", {
    when: function() {
        return dev["test_move"]["start"];
    },
    then: function() {
        dev["test_move"]["force_flag"] = false;
        dev["test_move"]["current_step"] = CONTROL_STEPS.SET_CONFIG;
        cycle_timer = setInterval(function() {
            if (dev["test_move"]["force_flag"]) {
                clearInterval(cycle_timer);
            }
            switch (dev["test_move"]["current_step"]) {
                case CONTROL_STEPS.SET_CONFIG:
                    manipulator_move_set_config(upper_pos);
                    man_log(LOG_POS_CONTROL.RULE, LOG_POS_CONTROL.SET_CONFIG);
                    dev["test_move"]["current_step"] += 1;
                    break;
                case CONTROL_STEPS.RUN:
                    manipulator_move_pos_run();
                    man_log(LOG_POS_CONTROL.RULE, LOG_POS_CONTROL.RUN);
                    dev["test_move"]["current_step"] += 1;
                    break;
                case CONTROL_STEPS.CHECK_RUNNING:
                    if (manipulator_move_check_running()) {
                        man_log(LOG_POS_CONTROL.RULE, LOG_POS_CONTROL.SET_CONFIG);
                        dev["test_move"]["current_step"] += 1;
                    } else {
                        manipulator_move_pos_run();
                    }
                    break;
                case CONTROL_STEPS.CHECK_POS:
                    if (manipulator_move_check_pos_x()) {
                        man_log(LOG_POS_CONTROL.RULE, LOG_POS_CONTROL.CHECK_POS);
                        dev["test_move"]["current_step"] += 1
                    }
                    break;
                case CONTROL_STEPS.SET_CONFIG_BACK:
                    manipulator_move_set_config(lower_pos);
                    man_log(LOG_POS_CONTROL.RULE, LOG_POS_CONTROL.SET_CONFIG);
                    dev["test_move"]["current_step"] += 1;
                    break;
                case CONTROL_STEPS.RUN_BACK:
                    manipulator_move_pos_run();
                    man_log(LOG_POS_CONTROL.RULE, LOG_POS_CONTROL.RUN);
                    dev["test_move"]["current_step"] += 1;
                    break;
                case CONTROL_STEPS.CHECK_RUNNING_BACK:
                    if (manipulator_move_check_running()) {
                        man_log(LOG_POS_CONTROL.RULE, LOG_POS_CONTROL.SET_CONFIG);
                        dev["test_move"]["current_step"] += 1;
                    } else {
                        manipulator_move_pos_run();
                    }
                    break;
                case CONTROL_STEPS.CHECK_POS_BACK:
                    if (manipulator_move_check_pos_x()) {
                        man_log(LOG_POS_CONTROL.RULE, LOG_POS_CONTROL.CHECK_POS);
                        dev["test_move"]["current_epoch"] += 1;
                        if (dev["test_move"]["current_epoch"] < epoch_number) {
                            dev["test_move"]["current_step"] = CONTROL_STEPS.SET_CONFIG;
                        } else {
                            dev["test_move"]["current_step"] += 1;
                        }
                    }
                    break;
                case CONTROL_STEPS.READY:
                    dev["test_move"]["current_step"] = CONTROL_STEPS.STANDBY;
                    dev["test_move"]["force_stop"] = false;
                    dev["test_move"]["current_epoch"] = 0;
                    clearInterval(cycle_timer);
                    man_log(LOG_POS_CONTROL.RULE, LOG_POS_CONTROL.READY);
                    break;
            }
        }, CYCLE_INTERVAL);
    }
});

function manipulator_move_set_config(pos) {
    dev["man_ui_move"]["axis_x_debug_req_pos"] = pos;
    EPR60_FUNC.EPR60_set_pos_config("AXIS_X_LOWER", pos, dev["man_ui_move"]["axis_x_debug_speed"], dev["man_ui_move"]["axis_x_debug_acc"], dev["man_ui_move"]["axis_x_debug_acc"], dev["man_ui_move"]["axis_x_debug_reverse"]);
    EPR60_FUNC.EPR60_set_pos_config("AXIS_X_UPPER", pos, dev["man_ui_move"]["axis_x_debug_speed"], dev["man_ui_move"]["axis_x_debug_acc"], dev["man_ui_move"]["axis_x_debug_acc"], dev["man_ui_move"]["axis_x_debug_reverse"]);
}

function manipulator_move_pos_run() {
    EPR60_FUNC.EPR60_start_pos_control("AXIS_X_LOWER");
    EPR60_FUNC.EPR60_start_pos_control("AXIS_X_UPPER");
}

function manipulator_move_check_pos_x() {
    return dev["man_ui_move"]["axis_x_debug_abs_pos"] == dev["man_ui_move"]["axis_x_debug_req_pos"];
}

function manipulator_move_check_running() {
    return EPR60_FUNC.EPR60_check_running_started("AXIS_X_LOWER") && EPR60_FUNC.EPR60_check_running_started("AXIS_X_UPPER");
}

// LOGGING for man_move
function man_log(rule, step) {
    dev["man_ui_move"]["status"] = "MAN UI RULE: \"" + rule + "\n\"STEP: \"" + step + "\"";
}



// Rules for button

defineRule("stop", {
    when: function() {
        return dev["test_move"]["stop"];
    },
    then: function() {
        EPR60_FUNC.EPR60_emergency_stop("AXIS_X_LOWER", dev["man"]["axis_x_default_emergency_dec"]);
        EPR60_FUNC.EPR60_emergency_stop("AXIS_X_UPPER", dev["man"]["axis_x_default_emergency_dec"]);
        dev["test_move"]["force_stop"] = true;
        dev["test_move"]["current_step"] = CONTROL_STEPS.STANDBY;
        dev["test_move"]["current_epoch"] = 0;
    }
});