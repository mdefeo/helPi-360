module.exports 	=	function(sqlize,DataTypes) {
	var claim 	=	sqlize.define('claim', {
		userID: {
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
		},
		authUserID: {
			type: DataTypes.INTEGER,
			allowNull: true
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