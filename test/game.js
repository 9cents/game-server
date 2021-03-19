let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src/app');

let assert = chai.assert;
let expect = chai.expect;
let should = chai.should();

const {
    sequelize,
    dataTypes,
    checkModelName,
    checkUniqueIndex,
    checkPropertyExists
} = require('sequelize-test-helpers')

chai.use(chaiHttp);

describe('Game', function() {
    
    /*
    * Test the /POST routes
    */
    context('/POST player', () => {
        it('Add a new player', done => {
            chai.request(server)
                .post('/register')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    name: "Test Player",
                    password: "test"
                })
                .end((err, res) => {
                    // console.error(res.body);
                    res.should.have.status(200);
                    expect(res.body.message).to.equal("Player added.");
                    done();
                })
        });

        it('Login to game', done => {
            chai.request(server)
                .post('/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    name: "Test Player",
                    password: "test"
                })
                .end((err, res) => {
                    // console.error(res.body);
                    res.should.have.status(200);
                    expect(res.body.message).to.equal("Passwords match");
                    done();
                })
        });
    })

    /*
     * Test the /GET routes
     */
    context('/GET information', () => {
        var player = {
            player_name: "Desmond"
        };
        
        it('Get all worlds', done => {
            chai.request(server)
                .get('/game/worldnames')
                .end((err, res) => {
                    // console.debug(res.body)
                    res.should.have.status(200);
                    done();
                })
        });

        it('Get all towers', done => {
            chai.request(server)
                .get('/game/towernames')
                .end((err, res) => {
                    // console.debug(res.body)
                    res.should.have.status(200);
                    done();
                })
        });

        it('Get all questions', done => {
            chai.request(server)
                .get('/game/worldquestions')
                .end((err, res) => {
                    // console.debug(res.body)
                    res.should.have.status(200);
                    done();
                })
        });

        it('Get all dungeon questions', done => {
            chai.request(server)
                .get('/game/challengedata?player_name=' + player.player_name)
                .end((err, res) => {
                    // console.debug(res.body)
                    res.should.have.status(200);
                    done();
                })
        });

        it('Get all leaderboard entries', done => {
            chai.request(server)
                .get('/game/leaderboard')
                .end((err, res) => {
                    // console.debug(res.body)
                    res.should.have.status(200);
                    done();
                })
        });

        it('Get a single leaderboard entry', done => {
            chai.request(server)
                .get('/game/leaderboard?player_name=' + player.player_name)
                .end((err, res) => {
                    // console.debug(res.body)
                    res.should.have.status(200);
                    done();
                })
        });
    })

    /*
     * Test the /PUT routes
     */
    context('/PUT dungeon', () => {
        var tplayer = {
            player_name: "Test Player"
        };

        it('Update dungeon questions', done => {
            chai.request(server)
                .put('/game/dungeon?player_name=' + tplayer.player_name)
                .set('content-type', 'application/json')
                .send([
                    "What is the course code?",
                    "What is the course name?",
                    "Who are the course coordinators?",
                    "How many AUs does the module hold?",
                    "When is the exam date for AY20/21 Semester 2?"
                ])
                .end((err, res) => {
                    // console.debug(res.body)
                    res.should.have.status(200);
                    done();
                })
        });
    })

    /*
    * Clean existing test data
    */
   context('Clean Test Data', () => {
    var user = {
        player_name: "Test Player"
    }

    it('Delete existing test dungeon', done => {
        chai.request(server)
            .delete('/dungeon')
            .set('content-type', 'application/json')
            .send(user)
            .end((err, res) => {
                // console.error(res.body);
                res.should.have.status(200);
                expect(res.body.message).to.equal("Row(s) deleted.");
                done();
            })
    });

    it('Delete existing test player', done => {
        chai.request(server)
            .delete('/player')
            .set('content-type', 'application/json')
            .send(user)
            .end((err, res) => {
                // console.error(res.body);
                res.should.have.status(200);
                expect(res.body.message).to.equal("Row(s) deleted.");
                done();
            })
    });
})
})