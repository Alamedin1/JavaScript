exports.MANIPULATOR_ACTUATOR_DRIVER = {
    set_actuator_state: set_actuator_state
}

function set_actuator_state(device, actuator_number, state) {
    switch (actuator_number) {
        case 1:
            return dev[device]["actuator_line_1"] = state;
        case 2:
            return dev[device]["actuator_line_2"] = state;
        case 3:
            return dev[device]["actuator_line_3"] = state;
        case 4:
            return dev[device]["actuator_line_4"] = state;
        case 5:
            return dev[device]["actuator_line_5"] = state;
        case 6:
            return dev[device]["actuator_line_6"] = state;
    }
}