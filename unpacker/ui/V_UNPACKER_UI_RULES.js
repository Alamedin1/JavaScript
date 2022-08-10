var config = new PersistentStorage("config", { global: true });

function unpacker_ui_rules_definition() {
    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var ui_name = config.UNP_UI_PREFIX + "rules_" + unpacker_index;
        defineVirtualDevice(ui_name, {
            title: ui_name,
            cells: {
                "unpack_start": {
                    type: "switch",
                    value: false
                },
                "arm_calib_start": {
                    type: "switch",
                    value: false
                },
                "buffer_calib_start": {
                    type: "switch",
                    value: false
                },
                "buffer_set_offset_start": {
                    type: "switch",
                    value: false
                },
                "turn_on_start": {
                    type: "switch",
                    value: false
                },
                "turn_off_start": {
                    type: "switch",
                    value: false
                }
            }
        });

        defineRule(ui_name + "unpack_start", {
            when: function() {
                return dev[ui_name]["unpack_start"];
            },
            then: function() {
                dev[ui_name]["unpack_start"] = false;
                if (dev[unpacker_name]["current_rule"] == config.UNP_RULES.EMPTY) {
                    dev[unpacker_name]["current_rule"] = config.UNP_RULES.UNPACK;
                    dev[unpacker_name]["current_step"] = config.UNP_RULES.EMPTY;
                    dev[unpacker_name]["force_stop"] = false;
                }
            }
        });

        defineRule(ui_name + "buffer_calib_start", {
            when: function() {
                return dev[ui_name]["buffer_calib_start"];
            },
            then: function() {
                dev[ui_name]["buffer_calib_start"] = false;
                if (dev[unpacker_name]["buffer_current_rule"] == config.UNP_RULES.EMPTY) {
                    dev[unpacker_name]["buffer_current_rule"] = config.UNP_RULES.BUFFER_CALIB;
                    dev[unpacker_name]["buffer_current_step"] = config.UNP_RULES.EMPTY;
                    dev[unpacker_name]["force_stop"] = false;
                }
            }
        });

        defineRule(ui_name + "buffer_set_offset_start", {
            when: function() {
                return dev[ui_name]["buffer_set_offset_start"];
            },
            then: function() {
                dev[ui_name]["buffer_set_offset_start"] = false;
                if (dev[unpacker_name]["buffer_current_rule"] == config.UNP_RULES.EMPTY) {
                    dev[unpacker_name]["buffer_requested_pos"] = dev[unpacker_name]["buffer_zero_offs_pos"] + dev[unpacker_name]["buffer_default_offs"] * dev[unpacker_name]["requested_offset"];
                    dev[unpacker_name]["buffer_current_rule"] = config.UNP_RULES.BUFFER_SET_OFFSET;
                    dev[unpacker_name]["buffer_current_step"] = config.UNP_RULES.EMPTY;
                    dev[unpacker_name]["force_stop"] = false;
                }
            }
        });
    }
}

unpacker_ui_rules_definition();