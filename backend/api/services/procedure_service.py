from ..models import (
    Procedures,
    ProcedureSteps,
    Requirements,
    ProcedureDocuments,
    FaqCategories,
    Faqs,
)


def get_full_procedure(procedure_id):

    # =========================
    # MAIN PROCEDURE
    # =========================

    procedure = Procedures.objects.get(
        pk=procedure_id
    )


    # =========================
    # STEPS
    # =========================

    steps = ProcedureSteps.objects.filter(
        procedure_id=procedure_id
    ).order_by(
        "step_number"
    )


    # =========================
    # REQUIREMENTS
    # =========================

    requirements_query = Requirements.objects.filter(
        procedure_id=procedure_id
    )


    requirements = []


    for requirement in requirements_query:


        is_document = ProcedureDocuments.objects.filter(
            procedure=procedure,
            document__document_name__iexact=requirement.requirement_name,
        ).exists()


        requirements.append({
            "requirement_id": requirement.requirement_id,
            "requirement_name": requirement.requirement_name,
            "is_document": is_document,
        })



    # =========================
    # FAQ CATEGORIES
    # =========================
    # NOTE:
    # We DO NOT flatten FAQs here anymore.
    # Views handle category → faqs grouping.

    faq_categories = FaqCategories.objects.filter(
        procedure_id=procedure_id
    )


    # =========================
    # RETURN
    # =========================

    return {
        "procedure": procedure,
        "steps": steps,
        "requirements": requirements,

        # optional raw categories only
        "faq_categories": faq_categories,
    }