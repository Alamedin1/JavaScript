exports.UNP_SENSOR_DRIVER = {
    check_buffer_tray_sensor: check_buffer_tray_sensor,
    check_buffer_limit_sensor: check_buffer_limit_sensor,
    check_stem_closed_sensor: check_stem_closed_sensor,
    check_gripper_tray_sensor: check_gripper_tray_sensor,
    check_catapulta_limit_sensor: check_catapulta_limit_sensor,
    check_catapulta_lid_opened_sensor: check_catapulta_lid_opened_sensor,
    check_arm_limit_sensor: check_arm_limit_sensor
}

function check_buffer_tray_sensor(sensor_device, tray_number) {
    switch (tray_number) {
        case 1:
            return dev[sensor_device]["tray_line_1"] == true;
        case 2:
            return dev[sensor_device]["tray_line_2"] == true;
        case 3:
            return dev[sensor_device]["tray_line_3"] == true;
        case 4:
            return dev[sensor_device]["tray_line_4"] == true;
        case 5:
            return dev[sensor_device]["tray_line_5"] == true;
        case 6:
            return dev[sensor_device]["tray_line_6"] == true;
    }
}

function check_buffer_limit_sensor(sensor_device) {
    return dev[sensor_device]["buffer_limit_sensor"] == true;
}

function check_stem_closed_sensor(sensor_device) {
    return dev[sensor_device]["stem_closed_sensor"] == true;
}

function check_gripper_tray_sensor(sensor_device) {
    return dev[sensor_device]["gripper_tray_sensor"] == true;
}

function check_catapulta_limit_sensor(sensor_device) {
    return dev[sensor_device]["catapulta_limit_sensor"] == true;
}

function check_catapulta_lid_opened_sensor(sensor_device) {
    return dev[sensor_device]["catapulta_lid_opened_sensor"] == true;
}

function check_arm_limit_sensor(sensor_device) {
    return dev[sensor_device]["arm_limit_sensor"] == true;
}