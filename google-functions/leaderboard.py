import urllib.request
import json

clint = {'Clint': {'Viktor':'Hovland', 'Brooks': 'Koepka', 'Max': 'Homa', 'Dustin': 'Johnson'}}
shane = {'Shane': {'Scottie': 'Scheffler', 'Collin': 'Morikawa', 'Cameron': 'Smith', 'Sungjae': 'Im'}}
craig = {'Craig': {'Rory': "McIlroy", 'Xander': 'Schauffele', 'Cameron': 'Young', 'Hideki': 'Matsuyama'}}
matt = {'Matt': {'Jon': 'Rahm', 'Patrick': 'Cantlay', 'Jordan': 'Spieth', 'Tony': 'Finau'}}

url = "https://ace-api.usga.org/scoring/v1/leaderboard.json?championship=uso&championship-year=2023"

def usopen_positions(request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """

    persons = [clint, shane, craig, matt]

    total_response = []
    with urllib.request.urlopen(url) as response:
      leaderboard = json.loads(response.read())
     
      for person in persons:
        positions = 0
        response = {'players': []}
        for personName, players in person.items():
          response['person'] = personName
          for firstname, lastname in players.items():
            for standings in leaderboard["standings"]:
              if standings["player"]["firstName"] == firstname and standings["player"]["lastName"] == lastname:
                player = {'name': (firstname + " " + lastname)}
                standing = standings["position"]["displayValue"]
                player["position"] = standing
                position = int(get_value(standing))
                positions += position
                response['players'].append(player)
        avg = positions / 4
        response['average'] = avg
        total_response.append(response)

    return json.dumps({'guys':total_response}), 200, {'Content-Type': 'application/json'}


def get_value(val):
  if "T" in val:
    return val.replace('T', '')
  return val
