'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

let desires = require('./api/desires.json');
let id = desires.length;
let commentId = desires.length;

const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

/*const access = [
    'http://localhost:3000',
    'http://pavelnbc.github.io/',
    'https://pavelnbc.github.io/'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (access.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};*/

app.get("/api/v1/desires", (req, res) => {
    desires.forEach((desire) => {
        desire.isEditing = false;
        desire.isDescriptionOpen = false;
    });

    res.send(desires);
});

app.post('/api/v1/desires', (req, res) => {
    let desire = {
        title: req.body.title,
        isCompleted: false,
        isEditing: false,
        description: req.body.description,
        isDescriptionOpen: false,
        comments: []
    };

    desire.id = id++;
    desires.push(desire);

    desires = desires.filter((desire) => {
        desire.isDescriptionOpen = false;
        desire.isEditing = false;

        return desire
    });

    res.send(desire)
});

app.put('/api/v1/complete-desire/:id', (req, res) => {
   desires = desires.filter((desire) => {
       if(desire.id === +req.params.id) {
           desire.isCompleted = !desire.isCompleted;
           desire.isDescriptionOpen = false;
       }
       return desire
   });

   res.send(req.params.id)
});

app.put('/api/v1/edit-desire/:id', (req, res) => {
    desires = desires.filter((desire) => {
        if(desire.id === +req.params.id) {
            desire.title = req.body.title;
            desire.isEditing = false;
        }
        return desire
    });
    
    let data = {
      id: +req.params.id,
      title: req.body.title  
    };

    res.send(data)
});

app.put('/api/v1/open-edit-form/:id', (req, res) => {
    desires = desires.filter((desire) => {
        if(desire.id === +req.params.id) {

            desire.isEditing = true;
            desire.isDescriptionOpen = false;
        } else {
            desire.isEditing = false;
        }
        return desire
    });

    res.send(req.params.id)
});

app.put('/api/v1/open-description-field/:id', (req, res) => {
    desires = desires.filter((desire) => {
        if(desire.id === +req.params.id) {
            desire.isDescriptionOpen = !desire.isDescriptionOpen;
        } else {
            desire.isDescriptionOpen = false;
        }

        desire.isEditing = false;

        return desire
    });

    res.send(req.params.id)
});

app.post('/api/v1/add-comment/:id', (req, res) => {
    let comment = {
        title: req.body.comment,
        id: commentId++
    };

    desires = desires.filter((desire) => {
        if(desire.id === +req.params.id) {
            desire.comments.push(comment)
        }
        return desire
    });

    let data = {
        id: +req.params.id,
        comment: comment
    };

    res.send(data)
});

app.delete('/api/v1/delete-desire/:id', (req, res) => {
    const index = desires.findIndex((desire) => {
        return desire.id === +req.params.id
    });

    if (index === -1) return res.sendStatus(404);

    desires.splice(index, 1);

    res.sendStatus(204);
});

app.delete('/api/v1/delete-comment/:id', (req, res) => {
    desires = desires.filter((desire) => {
        if(desire.id === req.params.id) {
            desire.comments = desire.comments.filter((comment) => {
                return comment.id !== req.body.commentId
            })
        }

        return desire
    });

    console.log(desires);

    res.sendStatus(204)
});

app.listen(app.get('port'), () => console.log(`Server is listening: http://localhost:${app.get('port')}`));



