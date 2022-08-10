exports.UNP_ACTUATOR_DRIVER = {
    set_tray_pusher_state: set_tray_pusher_state,
    set_vacuum_state: set_vacuum_state,
    set_air_state: set_air_state,
    set_gripper_state: set_gripper_state
}

function set_tray_pusher_state(device, state) {
    if (state) {
        dev[device]["tray_pusher"] = true;
    } else {
        dev[device]["tray_pusher"] = false;
    }
}

function set_vacuum_state(device, state) {
    if (state) {
        dev[device]["air"] = false;
    }
    dev[device]["vacuum"] = true;
}

function set_air_state(device, state) {
    if (state) {
        dev[device]["vacuum"] = false;
    }
    dev[device]["air"] = true;
}

function set_gripper_state(device, state) {
    if (state) {
        dev[device]["gripper_vacuum"] = false;
        dev[device]["gripper_air"] = true;
    } else {
        dev[device]["gripper_vacuum"] = true;
        dev[device]["gripper_air"] = false;
    }
}