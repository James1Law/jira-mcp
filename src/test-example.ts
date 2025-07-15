import { ProductManagerAgent } from './services/product-manager-agent';

/**
 * Example usage of the MCP Platform
 * This file demonstrates how to use the ProductManagerAgent programmatically
 */

async function runExample() {
  console.log('🧪 Running MCP Platform Example...\n');

  const agent = new ProductManagerAgent();

  try {
    // Example 1: Test integration
    console.log('1️⃣ Testing integration...');
    await agent.testIntegration();
    console.log('✅ Integration test completed\n');

    // Example 2: Process a query
    console.log('2️⃣ Processing a sample query...');
    const sampleQuery = 'How many work items are ready for production?';
    await agent.processQuery(sampleQuery);
    console.log('✅ Query processing completed\n');

    // Example 3: Get sprint summary
    console.log('3️⃣ Getting sprint summary...');
    const sprintReport = await agent.generateSprintSummary();
    console.log('📊 Sprint Summary:');
    console.log(`   Sprint: ${sprintReport.sprint.name}`);
    console.log(`   Total Items: ${sprintReport.totalItems}`);
    console.log(`   Ready for Production: ${sprintReport.readyForProduction}`);
    console.log(`   In Progress: ${sprintReport.inProgress}`);
    console.log(`   Blocked: ${sprintReport.blocked}`);
    console.log('✅ Sprint summary retrieved\n');

    // Example 4: Process different types of queries
    console.log('4️⃣ Testing different query types...');
    const queries = [
      'What is the current sprint status?',
      'How many items are blocked?',
      'Show me the sprint progress',
      'Count the work items in progress'
    ];

    for (const query of queries) {
      console.log(`   Processing: "${query}"`);
      await agent.processQuery(query);
      console.log(`   ✅ Completed: "${query}"`);
    }

    console.log('\n🎉 All examples completed successfully!');

  } catch (error) {
    console.error('❌ Example failed:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample().catch(console.error);
}

export { runExample }; 