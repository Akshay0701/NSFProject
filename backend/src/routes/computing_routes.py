from flask import Blueprint, request, jsonify
from src.services.open_ai_proposal_service import NSFProjectOpenAIChain
from src.services.compare_funded_project_service import CompareSimilarity
from src.utils.response_utils import error_response
from src.services.proposal_service import NSFProjectChain
from src.services.research_service import ResearchService
from src.services.team_service import TeamService

compute_bp = Blueprint('nsf/compute', __name__, url_prefix="/nsf/room")

@compute_bp.route('/extract-pdf-text', methods=['POST'])
def extract_pdf_text_route():
    if 'pdf' not in request.files:
        return error_response("No PDF file provided", 400)
    pdf_file = request.files['pdf']
    return ResearchService.extract_text_from_uploaded_pdf(pdf_file)

@compute_bp.route('/extract-link-text', methods=['POST'])
def extract_link_text_route():
    data = request.get_json()
    return ResearchService.extract_text_from_url(data)

@compute_bp.route('/extract-keywords', methods=['POST'])
def extract_keywords():
    data = request.get_json()
    return ResearchService.extract_research_from_room(data)

@compute_bp.route('/extract-keywords-nsf-solicitation', methods=['POST'])
def extract_keywords_nsf_solicitation():
    data = request.get_json()
    return ResearchService.extract_keywords_from_nsf_solitation(data)

@compute_bp.route('/update-keywords-nsf-solicitation', methods=['POST'])
def update_keywords_nsf_solicitation():
    data = request.get_json()
    return ResearchService.update_keywords_from_nsf_solitation(data)

@compute_bp.route('/update-keywords', methods=['POST'])
def update_keywords():
    data = request.get_json()
    return ResearchService.update_research_topics_for_user(data)

@compute_bp.route('/get-extracted-keywords', methods=['POST'])
def get_extract_keywords():
    data = request.get_json()
    return ResearchService.get_extracted_keywords(data)

@compute_bp.route('/create-team', methods=['POST'])
def create_team():
    data = request.get_json()
    return TeamService.create_teams_from_room(data)

@compute_bp.route('/generate-proposals', methods=['POST'])
def generate_proposals_route():
    data = request.get_json()
    nsf_chain = NSFProjectChain()
    return nsf_chain.generate_proposals_for_room(data)

@compute_bp.route('/compare-similarity', methods=['POST'])
def compare_similarity():
    data = request.get_json()
    return CompareSimilarity.compare_similarity_teams_project(data)