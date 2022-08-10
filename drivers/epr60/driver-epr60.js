exports.EPR60_DRIVER = {
    run_pos_config: run_pos_config,
    run_pos_config_2: run_pos_config_2,
    run_pos_config_3: run_pos_config_3,
    check_pos_config: check_pos_config,
    set_pos_config: set_pos_config,
    pos_control_completed: pos_control_completed,
    get_pos: get_pos,
    clear_position: clear_position,
    dec_pos_stop: dec_pos_stop,

    run_speed_config: run_speed_config,
    run_speed_config_2: run_speed_config_2,
    check_speed_config: check_speed_config,
    set_speed_config: set_speed_config,
    dec_speed_stop: dec_speed_stop,

    check_running_completed: check_running_completed,
    emergency_stop: emergency_stop,
    set_hot_reverse: set_hot_reverse,

    check_sensor_state: check_sensor_state,
    setup_input: setup_input
}

var EPR_MODES = {
    EXPECTATION: 0,
    POS_CONTROL: 1,
    SPEED_CONTROL: 3,
    EMERGENCY_STOP: 5,
    DECELERATION_STOP: 6
}

var input_settings = {
    NORMAL_CLOSED_INPUT: 54
}

//**********POS CONTROL FUNC**********


function run_pos_config(device) {
    log.info("run " + device + " pos config")
    publish("/devices/" + device + "/controls/mode_control/on", EPR_MODES.POS_CONTROL, 1);
}

function run_pos_config_2(device1, device2) {
    log.info("run " + device1 + "," + device2 + " pos config")
    publish("/devices/" + device1 + "/controls/mode_control/on", EPR_MODES.POS_CONTROL, 1);
    publish("/devices/" + device2 + "/controls/mode_control/on", EPR_MODES.POS_CONTROL, 1);
}

function run_pos_config_3(device1, device2, device3) {
    log.info("run " + device1 + "," + device2 + "," + device3 + " pos config")
    publish("/devices/" + device1 + "/controls/mode_control/on", EPR_MODES.POS_CONTROL, 1);
    publish("/devices/" + device2 + "/controls/mode_control/on", EPR_MODES.POS_CONTROL, 1);
    publish("/devices/" + device3 + "/controls/mode_control/on", EPR_MODES.POS_CONTROL, 1);
}

function check_pos_config(device, pos, speed, acc, dec, dir) {
    log.info("check " + device + " pos config")
    return dev[device]["pos_control_pos_low_16bit"] == (pos & 0xffff) &&
        dev[device]["pos_control_pos_high_16bit"] == (pos >> 16) &&
        dev[device]["pos_control_speed"] == speed &&
        dev[device]["pos_control_acc"] == acc &&
        dev[device]["pos_control_dec"] == dec &&
        dev[device]["position_mode_on"] == true &&
        dev[device]["reverse"] == dir;
}

function set_pos_config(device, pos, speed, acc, dec, dir) {
    log.info("set " + device + " pos config")
    dev[device]["pos_control_pos_low_16bit"] = pos & 0xffff;
    dev[device]["pos_control_pos_high_16bit"] = pos >> 16;
    dev[device]["pos_control_speed"] = speed;
    dev[device]["pos_control_acc"] = acc;
    dev[device]["pos_control_dec"] = dec;
    dev[device]["position_mode_on"] = true;
    dev[device]["reverse"] = dir;
}


function pos_control_completed(device, requested_pos) {
    return requested_pos == get_pos(device);
}

function get_pos(device) {
    return dev[device]["absolute_pos_low"] + (dev[device]["absolute_pos_high"] << 16);
}

function dec_pos_stop(device, dec) {
    if (dev[device]["pos_control_dec"] != dec) {
        dev[device]["pos_control_dec"] = dec;
    }
    if (dev[device]["mode_control"] != EPR_MODES.DECELERATION_STOP) {
        dev[device]["mode_control"] = EPR_MODES.DECELERATION_STOP;
    }
    return check_running_completed(device)
}

function clear_position(device) {
    dev[device]["clear_pos"] = true;
}

//**********SPEED CONTROL FUNC**********

function run_speed_config(device) {
    log.info("run " + device + " speed config")
    publish("/devices/" + device + "/controls/mode_control/on", EPR_MODES.SPEED_CONTROL, 1);
}

function run_speed_config_2(device1, device2) {
    log.info("run " + device1 + "," + device2 + " speed config")
    publish("/devices/" + device1 + "/controls/mode_control/on", EPR_MODES.SPEED_CONTROL, 1);
    publish("/devices/" + device2 + "/controls/mode_control/on", EPR_MODES.SPEED_CONTROL, 1);
}

function check_speed_config(device, speed, acc, dec, dir) {
    log.info("check " + device + " speed config")
    return dev[device]["speed_control_acc"] == acc &&
        dev[device]["speed_control_dec"] == dec &&
        dev[device]["speed_control_speed"] == speed &&
        dev[device]["position_mode_on"] == false &&
        dev[device]["reverse"] == dir;
}

function set_speed_config(device, speed, acc, dec, dir) {
    log.info("set " + device + " speed config")
    dev[device]["speed_control_acc"] = acc;
    dev[device]["speed_control_dec"] = dec;
    dev[device]["speed_control_speed"] = speed;
    dev[device]["position_mode_on"] = false;
    dev[device]["reverse"] = dir;
}


function dec_speed_stop(device, dec) {
    if (dev[device]["speed_control_dec"] != dec) {
        dev[device]["speed_control_dec"] = dec;
    }
    if (dev[device]["mode_control"] != EPR_MODES.DECELERATION_STOP) {
        dev[device]["mode_control"] = EPR_MODES.DECELERATION_STOP;
    }
    return check_running_completed(device)
}

//**********GENERAL CONTROL FUNC**********


function set_hot_reverse(device, dir) {
    dev[device]["reverse"] == dir;
}

function check_running_completed(device) {
    return dev[device]["state_running"] == false;
}

function emergency_stop(device, dec) {
    log.info(device + " emergency stop")
    dev[device]["emergency_stop_dec"] = dec;
    dev[device]["mode_control"] = EPR_MODES.EMERGENCY_STOP;
}

function setup_input(device, input_number) {
    switch (input_number) {
        case 1:
            dev[device]["setting_input_1"] = input_settings.NORMAL_CLOSED_INPUT;
            break;
        case 2:
            dev[device]["setting_input_2"] = input_settings.NORMAL_CLOSED_INPUT;
            break;
        case 3:
            dev[device]["setting_input_3"] = input_settings.NORMAL_CLOSED_INPUT;
            break;
        case 4:
            dev[device]["setting_input_4"] = input_settings.NORMAL_CLOSED_INPUT;
            break;
    }
}

function check_sensor_state(device, input_number) {
    switch (input_number) {
        case 1:
            return dev[device]["input_state_1"] == false;
        case 2:
            return dev[device]["input_state_2"] == false;
        case 3:
            return dev[device]["input_state_3"] == false;
        case 4:
            return dev[device]["input_state_4"] == false;
    }
}