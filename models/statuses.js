module.exports 	=	function(sqlize,DataTypes) {
	var status 	=	sqlize.define('status', {
		status: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "In progress"
		}
	}, {
		hooks: {
		},
		classMethods: {
		},
		instanceMethods: {
		}
	});
	return status;
};