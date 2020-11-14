function expand_parameter_value(parameter_value, properties){
	var search_pos = 0,
		delim_start = "${",
		delim_end = "}";
	var b = "";
	while(search_pos < parameter_value.length){
		var found_pos_start = parameter_value.indexOf(delim_start),
			found_pos_end = parameter_value.indexOf(delim_end),
			prop_val = ""
			prop_name = parameter_value.substr((found_pos_start + 2), ((found_pos_end - found_pos_start) - 2)),
			prop_val = properties[prop_name];

		if(found_pos_start == -1){
			return b;
		}

		b = parameter_value.substr(0, found_pos_start) + prop_val + parameter_value.substr(found_pos_end + 1, parameter_value.length);
		search_pos = found_pos_start + prop_val.length;
		parameter_value = b;
	}
	return b;
}