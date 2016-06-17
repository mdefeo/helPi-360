module.exports 	=	function(sqlize,DataTypes) {
	var action 	=	sqlize.define('action', {
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		taskId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		statusId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1
		}
	});
	return action;
};