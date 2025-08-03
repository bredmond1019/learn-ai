# Make Your LLM App a Domain Expert: How to Build an Expert System - Christopher Lovejoy, Anterior

## Video Metadata
**Title:** Make Your LLM App a Domain Expert: How to Build an Expert System  
**Channel:** Conference/Event Talk  
**Duration:** ~19:16  
**Date:** 2024  
**URL:** https://www.youtube.com/watch?v=MRM7oA3JsFs  
**Speaker(s):** Christopher Lovejoy (Medical Doctor, AI Engineer at Anterior)  

---

## Executive Summary
Christopher Lovejoy, a medical doctor turned AI engineer at Anterior, presents a comprehensive playbook for building domain-native LLM applications that achieve expert-level performance in specialized industries. He demonstrates how systematic domain expertise integration, not just more powerful models, is the key to solving the "last mile problem" in vertical AI applications.

---

## Key Takeaways
- **System Over Sophistication:** Domain expertise integration systems are more critical than model sophistication for vertical AI success
- **Last Mile Problem:** The biggest challenge isn't model capability but giving models proper industry-specific context and workflow understanding
- **95% to 99% Performance Jump:** Anterior improved from 95% to 99% accuracy through systematic domain expertise integration, not better models
- **Domain Expert-Driven Process:** Having domain experts (doctors, lawyers, etc.) directly involved in AI evaluation and improvement creates significant performance gains
- **Adaptive Domain Intelligence Engine:** A systematic approach to convert customer-specific domain insights into performance improvements

---

## Technical Concepts Covered

### Core Technologies
- **Florence AI:** Anterior's clinical reasoning AI system for healthcare administration
- **Adaptive Domain Intelligence Engine:** Framework for converting domain insights into AI performance improvements
- **Failure Mode Ontology:** Systematic categorization of AI failure types for targeted improvements
- **Production Data Evaluation:** Using real customer data rather than synthetic data for model improvement
- **Domain-Specific Eval Sets:** Custom evaluation datasets based on production failure modes

### Architecture & Design Patterns
- **Domain Expert in the Loop:** Direct integration of subject matter experts into the AI improvement process
- **Metric-Driven Development:** Optimizing for customer-specific metrics (e.g., false approval minimization in healthcare)
- **Failure Mode Classification:** Three-tier classification system (medical record extraction, clinical reasoning, rules interpretation)
- **Real-time Domain Knowledge Injection:** System allowing domain experts to add contextual knowledge in real-time
- **PM-Centric Workflow:** Domain expert product managers orchestrating the improvement process

### Code Examples & Implementations
```python
# Conceptual framework for domain expert feedback loop
class DomainExpertReview:
    def review_case(self, medical_record, ai_decision, guidelines):
        # Domain expert reviews AI output
        correctness = self.mark_correctness(ai_decision)
        failure_mode = self.classify_failure_mode(ai_decision) if not correctness
        domain_knowledge_suggestion = self.suggest_domain_knowledge()
        
        return {
            'correct': correctness,
            'failure_mode': failure_mode,
            'suggested_knowledge': domain_knowledge_suggestion,
            'performance_impact': self.calculate_metric_impact()
        }

# Failure mode ontology structure
failure_modes = {
    'medical_record_extraction': ['incomplete_data', 'misidentified_symptoms'],
    'clinical_reasoning': ['diagnostic_logic_error', 'treatment_pathway_mistake'],
    'rules_interpretation': ['guideline_misapplication', 'context_misunderstanding']
}
```

---

## Problem & Solution

### Problem Statement
Vertical AI applications hit a performance plateau around 95% accuracy because models lack the nuanced understanding of industry-specific workflows, terminology, and contextual requirements that human experts possess.

### Proposed Solution
Build an "Adaptive Domain Intelligence Engine" that systematically captures domain expert insights and converts them into AI performance improvements through structured measurement and iteration.

### Implementation Steps
1. **Define Customer Metrics:** Identify 1-2 critical metrics that customers care most about (e.g., false approval minimization)
2. **Create Failure Mode Ontology:** Systematically categorize all ways the AI can fail in domain-specific contexts
3. **Build Domain Expert Review Process:** Create tooling for experts to evaluate AI outputs and provide structured feedback
4. **Generate Production Data Sets:** Use real customer data to create targeted evaluation sets for each failure mode
5. **Implement Rapid Iteration Loop:** Enable same-day fixes through domain knowledge injection and automated evaluation

---

## Best Practices & Recommendations

### Do's
- Hire domain experts (doctors, lawyers, etc.) as product managers for vertical AI applications
- Focus on customer-specific metrics rather than generic accuracy measures
- Use production data over synthetic data for evaluation and improvement
- Create systematic failure mode classifications with domain expert involvement
- Build tooling that enables non-technical domain experts to contribute improvements
- Establish tight iteration loops between domain experts, PMs, and engineers

### Don'ts
- Don't rely solely on model improvements to achieve expert-level performance
- Don't let engineers classify failure modes without domain expert input
- Don't use generic evaluation metrics that don't align with customer priorities
- Don't attempt to solve the "last mile problem" with just better prompting or fine-tuning
- Don't separate domain expertise from the AI improvement process

### Performance Considerations
- Aim for 99%+ accuracy in high-stakes domains through systematic domain integration
- Expect diminishing returns from model improvements after 95% baseline
- Focus on customer-specific performance metrics rather than general benchmarks

### Security Considerations
- Ensure domain expert review processes comply with industry regulations (HIPAA, etc.)
- Implement proper access controls for sensitive domain-specific data
- Maintain audit trails for domain knowledge additions and changes

---

## Real-World Applications

### Use Cases
1. **Healthcare Administration:** Medical necessity reviews for insurance providers (Anterior's primary use case)
2. **Legal Contract Analysis:** Identifying critical terms and clauses in legal documents
3. **Fraud Detection:** Minimizing false positives in financial fraud detection systems
4. **Educational Assessment:** Optimizing AI tutoring systems for test score improvements

### Industry Examples
- **Anterior:** Serves health insurance providers covering 50 million lives in the US
- **Healthcare:** Clinical reasoning for treatment approval decisions
- **Legal:** Contract analysis and compliance checking
- **Finance:** Risk assessment and fraud prevention

---

## Metrics & Results
- **Accuracy Improvement:** From 95% to 99% accuracy through domain expertise integration
- **Scale:** Serving 50 million covered lives through health insurance providers
- **Recognition:** Won Clefspire award for AI performance achievements
- **Iteration Speed:** Same-day problem identification and resolution through domain expert tooling
- **Performance Baseline:** 95% accuracy achievable through model improvements alone

---

## Tools & Resources Mentioned

### Documentation & References
- Christopher Lovejoy's website: chris-lovejoy.me
- Anterior company website: anterior.com
- Contact email: chris@anterior.com
- Job opportunities: anterior.com/careers

### GitHub Repositories
- Not specifically mentioned, but focuses on bespoke tooling development

### Additional Learning Resources
- Domain expert evaluation methodologies
- Failure mode ontology design principles
- Production data evaluation techniques

---

## Questions & Discussions

### Key Questions Raised
1. How do you define the level of domain expertise required for different use cases?
2. Should domain expert review tooling be custom-built or use existing platforms?
3. Can customers themselves serve as domain experts for their specific workflows?

### Community Insights
- Domain expertise requirements vary by complexity - clinical reasoning needs doctors, simpler tasks may need nurses
- Bespoke tooling generally preferred for domain expert integration due to platform integration needs
- Hybrid approach possible where both internal domain experts and customer experts contribute

---

## Action Items
1. [ ] Identify the 1-2 most critical metrics your customers care about in your vertical
2. [ ] Hire or contract domain experts as product managers for your AI application
3. [ ] Design a failure mode ontology specific to your industry and use case
4. [ ] Build tooling that enables domain experts to review AI outputs and suggest improvements
5. [ ] Create production data evaluation sets based on real customer workflows
6. [ ] Establish rapid iteration loops between domain experts, PMs, and engineering teams

---

## Quotes & Insights
> "The system that you build for incorporating your domain insights is far more important than the sophistication of your models and your pipelines." - Christopher Lovejoy

> "We found we kind of hit a saturation around like 95% level... we then iterated based on this system and we really got to almost silly accuracy of like 99%." - Christopher Lovejoy

> "The limitation these days is not like how powerful is your model... It's more can your model understand the context in that industry for that particular customer." - Christopher Lovejoy

---

## Timeline Markers
- **[00:14]** - Introduction and Christopher's background (doctor to AI engineer)
- **[02:25]** - The "last mile problem" in domain-specific AI applications
- **[05:10]** - Anterior's bet: system over sophistication
- **[07:06]** - Measuring domain-specific performance framework
- **[11:40]** - Improvement processes and domain expert integration
- **[14:45]** - Q&A: Defining domain expertise levels
- **[17:45]** - Complete workflow and final takeaways

---

## Related Content
- **Related Video 1:** "How to Build Reliable AI Agents in 2025" - Complements systematic AI improvement approaches
- **Related Video 2:** "Context Engineering is the Future of AI Agents" - Aligns with domain context importance
- **Related Article:** Vertical AI application development and domain expertise integration strategies

---

## Summary Conclusion
Christopher Lovejoy's presentation provides a compelling framework for achieving expert-level AI performance in specialized domains. His key insight that "systems matter more than sophistication" challenges the common assumption that better models alone will solve domain-specific AI challenges. The Adaptive Domain Intelligence Engine framework offers a practical approach to the "last mile problem" by systematically integrating human domain expertise into AI improvement processes.

The presentation is particularly valuable for teams building vertical AI applications in regulated or high-stakes industries where 95% accuracy isn't sufficient. Lovejoy's emphasis on domain expert product managers, failure mode ontologies, and production data evaluation provides a actionable roadmap for achieving the 99%+ accuracy levels required for real-world deployment.

Most importantly, this approach democratizes AI improvement by enabling domain experts (who understand the nuances of their fields) to directly contribute to AI performance without requiring deep technical expertise. This bridges the gap between AI capabilities and domain requirements that has historically limited successful AI adoption in specialized industries.

---

## Tags
#Domain-Expert-AI #Vertical-AI #Healthcare-AI #AI-Performance #Expert-Systems #Production-AI #Domain-Knowledge #AI-Product-Management #Clinical-AI #LLM-Applications

---