from flask import Flask, json, request, jsonify
from flask_cors import CORS
from projectideacreation import NSFProjectChain
from research_extractor import extract_research_interests, extract_text_from_pdf  # Assuming this exists
from team_creator import form_teams, extract_main_research_areas

app = Flask(__name__)
CORS(app)  # Allows all origins by default

# Existing endpoint (example, adjust as per your actual implementation)
@app.route('/nsf/extract_interests', methods=['POST'])
def extract_interests():
    """Extract research interests from profiles with either text or PDF input."""
    if 'profiles' not in request.form:
        return jsonify({"error": "No profiles data provided"}), 400
    
    try:
        profiles_data = json.loads(request.form['profiles'])
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON in profiles field"}), 400

    results = []
    for index, profile in enumerate(profiles_data):
        name = profile.get('name')
        description = profile.get('description', '')
        
        # Check if a PDF file is provided for this profile
        pdf_field = f'pdf{index}'
        if pdf_field in request.files:
            pdf_file = request.files[pdf_field]
            extracted_text = extract_text_from_pdf(pdf_file)
            if extracted_text is None:
                return jsonify({"error": f"Failed to extract text from PDF for profile {index}"}), 400
            description = extracted_text
        
        # Skip if name or description is missing
        if not name or not description:
            continue
        
        # Extract research interests from the text (either from description or PDF)
        topics = extract_research_interests(description)
        results.append({"name": name, "research_topics": topics})
    
    return jsonify(results), 200

# New endpoint for team creation
@app.route('/nsf/teamcreation', methods=['POST'])
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


# Instantiate the NSFProjectChain
nsf_chain = NSFProjectChain()

@app.route('/nsf/generate-proposals', methods=['POST'])
def generate_proposals():
    teams = request.get_json()
    if not teams:
        return jsonify({"error": "No teams data provided"}), 400
    
    # For each team, call Groq via our NSFProjectChain to generate project proposals.
    for team in teams:
        try:
            proposals = nsf_chain.generate_project_proposals(team)
            team["project_proposals"] = proposals
        except Exception as e:
            # Optionally log the error; here we include an error message in the team output.
            team["project_proposals"] = [f"Error generating proposals: {str(e)}"]
    
    # Return the updated teams list as JSON.
    return jsonify(teams), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8001, debug=True)