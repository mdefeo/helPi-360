module.exports 	=	function(sqlize,DataTypes) {
	var task 	=	sqlize.define('task', {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1,255]
			}
		},
		points: {
			type: DataTypes.DECIMAL,
			allowNull: false
		},
		description: {
			type: DataTypes.STRING,
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
	return task;
};