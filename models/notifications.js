module.exports 	=	function(sqlize,DataTypes) {
	var notification 	=	sqlize.define('status', {
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		type: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	});
	return notification;
};