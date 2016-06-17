module.exports 	=	function(sqlize,DataTypes) {
	var action 	=	sqlize.define('action', {
		userId: {
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