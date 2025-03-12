from flask import Flask, request, jsonify
from flask_cors import CORS
from research_extractor import extract_research_interests  # Assuming this exists
from team_creator import form_teams, extract_main_research_areas

app = Flask(__name__)
CORS(app)  # Allows all origins by default

# Existing endpoint (example, adjust as per your actual implementation)
@app.route('/extract_interests', methods=['POST'])
def extract_interests():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    results = []
    for profile in data:
        name = profile.get('name')
        description = profile.get('description')
        if not name or not description:
            continue
        topics = extract_research_interests(description)
        results.append({"name": name, "research_topics": topics})
    return jsonify(results), 200

# New endpoint for team creation
@app.route('/teamcreation', methods=['POST'])
def teamcreation():
    """
    Creates teams from a list of researchers based on their research topics.
    
    Expects a JSON payload like:
    [
        {"name": "John Doe", "research_topics": ["Machine Learning", "NLP"]},
        {"name": "Jane Smith", "research_topics": ["Computer Vision", "Robotics"]}
    ]
    
    Returns a JSON response with team details.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Convert input list to dictionary
    profiles = {profile['name']: profile['research_topics'] for profile in data}

    # Form teams
    teams = form_teams(profiles, max_team_size=4)

    # Extract research areas
    team_research_areas = extract_main_research_areas(profiles, teams)

    # Structure the output
    output = []
    for team_id, members in enumerate(teams):
        team_data = {
            "team_id": team_id + 1,
            "team_size": len(members),
            "members": members,
            "team_research_areas": team_research_areas[team_id]["team_fields"],
            "member_fields": team_research_areas[team_id]["member_fields"]
        }
        output.append(team_data)

    return jsonify(output)

if __name__ == "__main__":
    app.run(debug=True)