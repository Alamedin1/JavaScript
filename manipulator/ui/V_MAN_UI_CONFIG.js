var config = new PersistentStorage("config", { global: true });
var axis_x_default_buffer_pos_config = new PersistentStorage("axis_x_default_buffer_pos", { global: true });
var axis_z_default_buffer_pos_config = new PersistentStorage("axis_z_default_buffer_pos", { global: true });
var axis_z_default_buffer_offs_config = new PersistentStorage("axis_z_default_buffer_offs", { global: true });


function man_ui_config_definition() {
    var ui_name = config.MAN_UI_PREFIX + "config";
    defineVirtualDevice(ui_name, {
        title: ui_name,
        cells: {
            "axis_x_default_buffer_pos": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_default_buffer_pos": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_default_buffer_offs": {
                type: "value",
                readonly: false,
                value: 0
            },
            "requested_buffer_module": {
                type: "value",
                readonly: false,
                value: 0
            },
            "save_buffer_config": {
                type: "switch",
                readonly: false,
                value: 0
            }
        }
    });

    defineRule("save_buffer_pos", {
        when: function() {
            return dev[ui_name]["save_buffer_config"];
        },
        then: function() {
            log.info("saving buffer ", dev[ui_name]["requested_buffer_module"], " setup");
            dev[ui_name]["save_buffer_config"] = false;
            axis_x_default_buffer_pos_config[dev[ui_name]["requested_buffer_module"].toString()] = dev[ui_name]["axis_x_default_buffer_pos"];
            axis_z_default_buffer_pos_config[dev[ui_name]["requested_buffer_module"].toString()] = dev[ui_name]["axis_z_default_buffer_pos"];
            axis_z_default_buffer_offs_config[dev[ui_name]["requested_buffer_module"].toString()] = dev[ui_name]["axis_z_default_buffer_offs"];
            log.info("buffer ", dev[ui_name]["requested_buffer_module"], " saved");
        }
    });

    defineRule("change_buffer_module", {
        whenChanged: function() {
            return dev[ui_name]["requested_buffer_module"];
        },
        then: function() {
            log.info("loading buffer ", dev[ui_name]["requested_buffer_module"], " setup");
            dev[ui_name]["axis_x_default_buffer_pos"] = get_valid(axis_x_default_buffer_pos_config[dev[ui_name]["requested_buffer_module"].toString()]);
            dev[ui_name]["axis_z_default_buffer_pos"] = get_valid(axis_z_default_buffer_pos_config[dev[ui_name]["requested_buffer_module"].toString()]);
            dev[ui_name]["axis_z_default_buffer_offs"] = get_valid(axis_z_default_buffer_offs_config[dev[ui_name]["requested_buffer_module"].toString()]);
            log.info("buffer ", dev[ui_name]["requested_buffer_module"], " loaded");
        }
    });
};

function get_valid(value) {
    if (value != undefined) {
        return value
    }
    return 0
}

man_ui_config_definition();