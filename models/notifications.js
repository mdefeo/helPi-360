module.exports 	=	function(sqlize,DataTypes) {
	var notification 	=	sqlize.define('status', {
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: 'users', key: 'id' }
		},
		type: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: 'notificationTypes', key: 'id' }
		}
	});
	return notification;
};
