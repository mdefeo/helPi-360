module.exports 	=	function(sqlize,DataTypes) {
	var action 	=	sqlize.define('action', {
		userID: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		taskID: {
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
		},
		active: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 1
		}
	}, {
		hooks: {
		},
		classMethods: {
		},
		instanceMethods: {
		}
	});
	return action;
};