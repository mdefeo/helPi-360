module.exports 	=	function(sqlize,DataTypes) {
	var assigned =	sqlize.define('assigned', {
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: 'users', key: 'id' }
		},
		taskId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: 'tasks', key: 'id' }
		},
		statusId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1,
			references: { model: 'statuses', key: 'id' }

		}
	});
	return assigned;
};
