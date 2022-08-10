exports.MANIPULATOR_SENSOR_DRIVER = {
    get_stem_state: get_stem_state,
    get_tray_state: get_tray_state
}

function get_stem_state(device, actuator_number) {
    switch (actuator_number) {
        case 1:
            return dev[device]["stem_line_1"] == true;
        case 2:
            return dev[device]["stem_line_2"] == true;
        case 3:
            return dev[device]["stem_line_3"] == true;
        case 4:
            return dev[device]["stem_line_4"] == true;
        case 5:
            return dev[device]["stem_line_5"] == true;
        case 6:
            return dev[device]["stem_line_6"] == true;
    }
}

function get_tray_state(device, tray_number) {
    switch (tray_number) {
        case 1:
            return dev[device]["tray_line_1"] == true;
        case 2:
            return dev[device]["tray_line_2"] == true;
        case 3:
            return dev[device]["tray_line_3"] == true;
        case 4:
            return dev[device]["tray_line_4"] == true;
        case 5:
            return dev[device]["tray_line_5"] == true;
        case 6:
            return dev[device]["tray_line_6"] == true;
    }
}