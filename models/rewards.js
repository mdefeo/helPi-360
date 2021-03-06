module.exports 	=	function(sqlize,DataTypes) {
	var reward 	=	sqlize.define('reward', {
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
		type: {
			type: DataTypes.STRING,
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
	return reward;
};