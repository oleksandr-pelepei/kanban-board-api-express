var express = require('express');
var passport = require('passport');

var User = require('../models/User');
var router = express.Router();


router.get('/users/search/:searchString', function(req, res) {
  var searchString = req.params.searchString || '';

	if (searchString != '') {
		User
			.find({
				$or: [
					{
						first_name: {
							$regex: searchString,
							$options: 'i'
						}
					},
					{
						last_name: {
							$regex: searchString,
							$options: 'i'
						}
					},
					{
						email: {
							$regex: searchString,
							$options: 'i'
						}
					}
				]
			})
			.select('-password')
			.exec(function(err, users) {

				if (err) {
					res.json([]);
				} else {
					res.json(users);
				}

			});
	} else {
		res.json([]);
	}
});

module.exports = router;