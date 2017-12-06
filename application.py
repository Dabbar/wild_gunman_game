import os
from flask import Flask, request, url_for, send_from_directory, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__,  static_url_path='')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']

db = SQLAlchemy(app)


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    kills = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Integer, nullable=False)

    def __init__(self, name, kills, score):
        self.name = name
        self.kills = kills
        self.score = score


@app.route("/")
def index():
    '''Serve static'''
    return send_from_directory('static', 'index.html')


@app.route("/game/add", methods=["POST"])
def add_game():
    '''Insert game in db'''
    if request.method == "POST":
        name = request.form.get("name")
        score = request.form.get("score")
        kills = request.form.get("kills")

    current_game = Game(name, kills, score)
    db.session.add(current_game)
    db.session.commit()

    '''return current game index'''
    return jsonify({"status": 'ok', 'idx': current_game.id})


@app.route("/game/list", methods=["GET"])
def get_games():
    '''return all games'''
    games = Game.query.order_by(Game.score.desc()).all()
    gamesArr = []
    for game in games:
        gamesArr.append({
            'id': game.id,
            'name': game.name,
            'kills': game.kills,
            'score': game.score
        })

    return jsonify(gamesArr)


@app.route("/game/get", methods=["POST"])
def get_game():
    '''return single game by index'''
    idx = request.get_json()["idx"]
    current_game = Game.query.filter_by(
        id=idx).first()

    return jsonify({
        'id': current_game.id,
            'name': current_game.name,
            'kills': current_game.kills,
            'score': current_game.score
    })


if __name__ == '__main__':
    app.run()
