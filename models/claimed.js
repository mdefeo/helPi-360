module.exports 	=	function(sqlize,DataTypes) {
	var claim 	=	sqlize.define('claim', {
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: 'users', key: 'id' }
		},
		rewardId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: 'rewards', key: 'id' }
		},
		statusId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1,
			references: { model: 'statuses', key: 'id' }
		}
	});
	return claim;
};