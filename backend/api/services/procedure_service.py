from ..models import (
    Procedures,
    ProcedureSteps,
    ProcedureRequirements,
    FaqCategories,
    Faqs
)


def get_full_procedure(procedure_id):

    # =========================
    # MAIN PROCEDURE
    # =========================
    procedure = Procedures.objects.get(pk=procedure_id)

    # =========================
    # STEPS
    # =========================
    steps = ProcedureSteps.objects.filter(
        procedure_id=procedure_id
    ).order_by("step_number")

    # =========================
    # REQUIREMENTS
    # =========================
    requirement_links = (
        ProcedureRequirements.objects
        .filter(procedure_id=procedure_id)
        .select_related("requirement")
    )

    requirements = [
        {
            "requirement_id": link.requirement.requirement_id,
            "requirement_name": link.requirement.requirement_name,
        }
        for link in requirement_links
    ]

    # =========================
    # FAQ CATEGORIES (OPTIONAL RAW SOURCE ONLY)
    # =========================
    # NOTE: We DO NOT flatten FAQs here anymore.
    # Views will handle category → faqs grouping.

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

        # optional raw categories only (not used directly in UI anymore)
        "faq_categories": faq_categories,
    }