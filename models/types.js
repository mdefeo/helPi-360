module.exports 	=	function(sqlize,DataTypes) {
	var notification_type 	=	sqlize.define('status', {
		name: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});
	return notification_type;
};