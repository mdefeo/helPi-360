module.exports 	=	function(sqlize,DataTypes) {
	var claim 	=	sqlize.define('claim', {
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		rewardId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		statusId: {
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