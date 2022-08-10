var config = new PersistentStorage("config", { global: true });

/* GENERAL SETTINGS */
config.CYCLE_INTERVAL = 10;
config.INIT_CONFIG_TIMEOUT = 1000;

/* MAN SETTINGS */
/********** MAN PREFIX **********/
config.MAN_DEVICE_ID = 1;
config.MAN_PREFIX = "man";
config.MAN_UI_PREFIX = "man_ui_";
config.MAN_X_L_PREFIX = "man_x_l";
config.MAN_X_U_PREFIX = "man_x_u";
config.MAN_Z_PREFIX = "man_z";
config.MAN_SENSOR_PREFIX = "man_sensor";
config.MAN_ACTUATOR_PREFIX = "man_actuator";
/********** MAN GLOBAL VARS **********/
config.NUMBER_OF_TRAPPER_LINES = 6;
config.ACTUATOR_SHOT_TIME = 1000; //ms

/* UNPACKER SETTINGS */
/********** UNPACKER PREFIX **********/
config.UNP_DEVICE_ID = 1;
config.UNP_PREFIX = "unpacker_";
config.UNP_UI_PREFIX = "unpacker_ui_";
config.UNP_SENSOR_PREFIX = "unpacker_sensor_";
config.UNP_ACTUATOR_PREFIX = "unpacker_actuator_";
config.UNP_BUFFER_MOTOR_PREFIX = "unpacker_buffer_motor_";
config.UNP_CATAPULTA_MOTOR_PREFIX = "unpacker_catapulta_motor_";
config.UNP_ARM_MOTOR_PREFIX = "unpacker_arm_motor_";
/********** UNPACKER GLOBAL VARS **********/
config.NUMBER_OF_UNPACKERS = 1;


/* MODULE SETTINGS */
/********** MODULE PREFIX **********/
config.MOD_DEVICE_ID = 3;
config.MOD_PREFIX = "salad_module_";
config.MOD_UI_PREFIX = "salad_module_ui_";
config.MOD_MOTOR_PREFIX = "salad_module_motor_";