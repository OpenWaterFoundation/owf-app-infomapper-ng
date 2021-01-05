class Parameters{
	
	constructor(parameterFile, label){
        this.parameters;
        this.parameterFile = parameterFile;
        this.json;
        this.label = label
        this.convert_to_json();
    }

    convert_to_json(){
        var _this = this;
        $.ajax({
			url: _this.parameterFile,
			async: false,
			dataType: 'text',
			error: function(error){
				throw new Error(error);
			},
			success: function(data){
				_this.csv = data;
                var csv = Papa.parse(data,{header:true, comments:true, dynamicTyping:true}).data;
                var jsonObj = {};
                for(var i = 0; i < csv.length - 1; i++){
                    jsonObj[csv[i].stationnumid] = csv[i]
                }
                _this.json = jsonObj;
			}
        })
    }
}