module.exports 	=	function(sqlize,DataTypes) {
	var status 	=	sqlize.define('status', {
		status: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 0
		}
	}, {
		hooks: {
		},
		classMethods: {
		},
		instanceMethods: {
		}
	});
	return claim;
};