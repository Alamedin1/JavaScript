var config = new PersistentStorage("config", { global: true });

function test_switch() {
    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var buffer_motor_name = config.UNP_BUFFER_MOTOR_PREFIX + unpacker_index;
        var catapulta_motor_name = config.UNP_CATAPULTA_MOTOR_PREFIX + unpacker_index;
        var arm_motor_name = config.UNP_ARM_MOTOR_PREFIX + unpacker_index;

        defineVirtualDevice("test", {
            title: "test",
            cells: {
                "force_stop": {
                    type: "switch",
                    value: false
                },
                "start_test": {
                    type: "switch",
                    value: false
                },
                "start_all_calib": {
                    type: "switch",
                    value: false
                }
            }
        });

        defineRule("TEST_START", {
            when: function() {
                return dev["test"]["start_test"]
            },
            then: function() {
                dev["test"]["start_test"] = false;
                if (dev[unpacker_name]["buffer_current_rule"] == config.UNP_RULES.EMPTY &&
                    dev[unpacker_name]["current_rule"] == config.UNP_RULES.EMPTY &&
                    dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.EMPTY) {

                    log.info("Initializing current_rules and currents_steps")
                    dev[unpacker_name]["current_rule"] = config.UNP_RULES.TEST;
                    dev[unpacker_name]["buffer_current_rule"] = config.UNP_RULES.TEST;
                    dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.TEST;
                    // dev[unpacker_name]["buffer_current_step"] = 0;
                    // dev[unpacker_name]["current_step"] = 0;
                    // dev[config.MAN_PREFIX]["current_step"] = 0;
                }
            }
        });

        defineRule("ALL_CALIB_START", {
            when: function() {
                return dev["test"]["start_all_calib"]
            },
            then: function() {
                dev["test"]["start_all_calib"] = false;
                if (dev[unpacker_name]["buffer_current_rule"] == config.UNP_RULES.EMPTY &&
                    dev[unpacker_name]["current_rule"] == config.UNP_RULES.EMPTY &&
                    dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.EMPTY) {

                    log.info("Initializing current_rules and currents_steps")
                        //_____UNPACKER_BUFFER_CALIB____//

                    dev[unpacker_name]["current_rule"] = config.UNP_RULES.BUFFER_CALIB;
                    // dev[unpacker_name]["buffer_current_step"] = 0;
                    // dev[unpacker_name]["current_step"] = 0;

                    //_____UNPACKER_ARM_CALIB____//

                    dev[unpacker_name]["current_rule"] = config.UNP_RULES.ARM_CALIB;
                    // dev[unpacker_name]["current_step"] = 0;

                    //____MAN_X_CALIB____//

                    dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.AXIS_X_CALIB;
                    // dev[config.MAN_PREFIX]["current_step"] = 0;

                    //____MAN_X_CALIB____//

                    dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.AXIS_Z_CALIB;
                    // dev[config.MAN_PREFIX]["current_step"] = 0;
                }
            }
        });


        defineRule("FORCE_STOP", {
            when: function() {
                return dev["test"]["force_stop"]
            },
            then: function() {
                dev["test"]["force_stop"] = false;
                dev[unpacker_name]["force_stop"] = true;
                dev[config.MAN_PREFIX]["force_stop"] = true;

                //___publush_all_device___//
                all_force_stop(buffer_motor_name, catapulta_motor_name, arm_motor_name, config.MAN_X_L_PREFIX, config.MAN_X_U_PREFIX, config.MAN_Z_PREFIX);
            }
        });
    }
}


function all_force_stop(device_1, device_2, device_3, device_4, device_5, device_6) {
    publish("/devices/" + device_1 + "/controls/mode_control/on", "5", 5);
    publish("/devices/" + device_2 + "/controls/mode_control/on", "5", 5);
    publish("/devices/" + device_3 + "/controls/mode_control/on", "5", 5);
    publish("/devices/" + device_4 + "/controls/mode_control/on", "5", 5);
    publish("/devices/" + device_5 + "/controls/mode_control/on", "5", 5);
    publish("/devices/" + device_6 + "/controls/mode_control/on", "5", 5);
}

test_switch()