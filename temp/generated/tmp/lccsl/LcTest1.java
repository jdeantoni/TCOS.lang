package lccsl;

import fr.kairos.timesquare.ccsl.ISimpleSpecification;
import fr.kairos.timesquare.ccsl.eccogen.EfficientCompileUtility;
import fr.kairos.timesquare.ccsl.simple.ISpecificationBuilder;

public class LcTest1 implements ISpecificationBuilder
{
	static public LcTest1 INSTANCE = new LcTest1();
	public void build(ISimpleSpecification spec)
	{
		spec.addClock("Model0_0_8_9_startEvaluation");
		spec.addClock("Model0_0_8_9_finishEvaluation");
		spec.addClock("VarDecl0_0_0_9_startEvaluation");
		spec.addClock("VarDecl0_0_0_9_finishEvaluation");
		spec.addClock("VarDecl1_0_1_9_startEvaluation");
		spec.addClock("VarDecl1_0_1_9_finishEvaluation");
		spec.addClock("Assignment2_0_2_9_startEvaluation");
		spec.addClock("Assignment2_0_2_9_finishEvaluation");
		spec.addClock("If3_0_7_1_startEvaluation");
		spec.addClock("If3_0_7_1_finishEvaluation");
		spec.addClock("If3_0_7_1_evalCond");
		spec.addClock("If3_0_7_1_condTrue");
		spec.addClock("If3_0_7_1_condFalse");
		spec.addClock("Bloc3_6_5_1_startEvaluation");
		spec.addClock("Bloc3_6_5_1_finishEvaluation");
		spec.addClock("Assignment4_4_4_9_startEvaluation");
		spec.addClock("Assignment4_4_4_9_finishEvaluation");
		spec.addClock("Bloc5_5_7_1_startEvaluation");
		spec.addClock("Bloc5_5_7_1_finishEvaluation");
		spec.addClock("Assignment6_4_6_9_startEvaluation");
		spec.addClock("Assignment6_4_6_9_finishEvaluation");
		spec.addClock("Assignment8_0_8_9_startEvaluation");
		spec.addClock("Assignment8_0_8_9_finishEvaluation");
		spec.precedence("VarDecl0_0_0_9_startEvaluation", "VarDecl0_0_0_9_finishEvaluation", 0, 1);
		spec.precedence("VarDecl1_0_1_9_startEvaluation", "VarDecl1_0_1_9_finishEvaluation", 0, 1);
		spec.precedence("Assignment2_0_2_9_startEvaluation", "Assignment2_0_2_9_finishEvaluation", 0, 1);
		spec.precedence("If3_0_7_1_startEvaluation", "If3_0_7_1_finishEvaluation", 0, 1);
		spec.subclock("If3_0_7_1_startEvaluation", "If3_0_7_1_evalCond");
		spec.subclock("If3_0_7_1_evalCond", "If3_0_7_1_startEvaluation");
		spec.union("tmp_If3_0_7_1_xor", "If3_0_7_1_condTrue", "If3_0_7_1_condFalse");
		spec.exclusion("If3_0_7_1_condTrue", "If3_0_7_1_condFalse");
		spec.precedence("If3_0_7_1_evalCond", "tmp_If3_0_7_1_xor", 0, -1);
		spec.precedence("Bloc3_6_5_1_startEvaluation", "Bloc3_6_5_1_finishEvaluation", 0, 1);
		spec.subclock("Bloc3_6_5_1_startEvaluation", "Assignment4_4_4_9_startEvaluation");
		spec.subclock("Assignment4_4_4_9_startEvaluation", "Bloc3_6_5_1_startEvaluation");
		spec.subclock("Bloc3_6_5_1_finishEvaluation", "Assignment4_4_4_9_finishEvaluation");
		spec.subclock("Assignment4_4_4_9_finishEvaluation", "Bloc3_6_5_1_finishEvaluation");
		spec.precedence("Assignment4_4_4_9_startEvaluation", "Assignment4_4_4_9_finishEvaluation", 0, 1);
		spec.precedence("Bloc5_5_7_1_startEvaluation", "Bloc5_5_7_1_finishEvaluation", 0, 1);
		spec.subclock("Bloc5_5_7_1_startEvaluation", "Assignment6_4_6_9_startEvaluation");
		spec.subclock("Assignment6_4_6_9_startEvaluation", "Bloc5_5_7_1_startEvaluation");
		spec.subclock("Bloc5_5_7_1_finishEvaluation", "Assignment6_4_6_9_finishEvaluation");
		spec.subclock("Assignment6_4_6_9_finishEvaluation", "Bloc5_5_7_1_finishEvaluation");
		spec.precedence("Assignment6_4_6_9_startEvaluation", "Assignment6_4_6_9_finishEvaluation", 0, 1);
		spec.precedence("Assignment8_0_8_9_startEvaluation", "Assignment8_0_8_9_finishEvaluation", 0, 1);
	}
	static public void main(String[] args)
	{
		EfficientCompileUtility utility = new EfficientCompileUtility();
		utility.treat("Test1", INSTANCE);
	}
}
