// 1	In progress
// 2	Completed
// 3	Approved
// 4	Denied

module.exports 	=	function(sqlize,DataTypes) {
	var status 	=	sqlize.define('status', {
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true
		}
	});
	return status;
};