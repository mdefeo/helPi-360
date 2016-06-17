module.exports 	=	function(sqlize,DataTypes) {
	var notificationType 	=	sqlize.define('status', {
		name: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});
	return notificationType;
};