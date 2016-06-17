module.exports 	=	function(sqlize,DataTypes) {
	var claim 	=	sqlize.define('claim', {
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		rewardID: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		status: {
			type: DataTypes.BOOLEAN,
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