const { Comment, Pizza } = require('../models/');

const commentController = {
    // add comment to pizza
    addComment({ params, body }, res) {
        console.log(body);
        Comment.create(body)
        .then(({ _id }) => {
            return Pizza.findOneAndUpdate( 
                { _id: params.pizzaId },
                { $push: { comments: _id } },
                // this receives back the updated pizza with the new comment included {new: true}
                { new: true, runValidators: true  }
            );
        })
        .then(dbPizzaData => {
            if (!dbPizzaData) {
                res.status(404).json({ message: 'No pizza found with this id!' });
                return;
            }
            res.json(dbPizzaData);
        })
        .catch(err => res.json(err));
    },

    addReply({ params, body }, res) {
        Comment.findOneAndUpdate(
            { _id: params.commentId },
            { $push: { replies: body } },
            { new: true, runValidators: true  }
        )
        .then(dbPizzaData => {
            if (!dbPizzaData) {
                res.status(404).json({ message: 'No pizza found with this id!'});
                return;
            }
            res.json(dbPizzaData);
        })
        .catch(err => res.json(err));
    },

    // remove reply
    removeReply({ params }, res) {
        Comment.findOneAndUpdate(
            { _id: params.commentId },
            { $pull: { replies: { replyId: params.replyId } } },
            { new: true }
        )
        .then(dbPizzaData => res.json(dbPizzaData))
        .catch(err => res.json(err))
    },

    // remove comment
    removeComment({ params }, res) {
        //this deletes the comment document 
        Comment.findOneAndDelete({ _id: params.commentId })
        .then(deletedComment => {
            if (!deletedComment) {
                return res.status(404).json({ message: 'No comment with this id!' })
            }
            return Pizza.findOneAndUpdate(
                { _id: params.pizzaId },
                //this removes it from the pizza and return the pizza again without the comment
                { $pull: { comments: params.commentId } },
                { new: true }
            );
        })
        .then(dbPizzaData => {
            if (!dbPizzaData) {
                res.status(404).json({ message: 'No pizza foudn with this id!' });
                return;
            }
            res.json(dbPizzaData);
        })
        .catch(err => res.json(err));
    }
};

module.exports = commentController; 