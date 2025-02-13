package org.jqassistant.plugin.typescript;

import com.buschmais.jqassistant.core.shared.io.ClasspathResource;
import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.jqassistant.core.test.plugin.AbstractPluginIT;
import org.jqassistant.plugin.typescript.api.TypescriptScope;
import org.junit.jupiter.api.Test;

import java.io.File;

public class TypescriptProjectScannerIT  extends AbstractPluginIT {

    @Test
    public void testScanReportFileDescriptor() {
        File file = ClasspathResource.getFile(TypescriptProjectScannerIT.class, "/sample-project/.reports/jqa/ts-output.json");
        Descriptor descriptor = getScanner().scan(file, file.getAbsolutePath(), TypescriptScope.PROJECT);
        store.beginTransaction();

//        assertThat(descriptor).isInstanceOf(ScanReportFileDescriptor.class);
//
//        TestResult testResult = query("MATCH (report:Json:File:NexusIQ:ScanReport) RETURN report");
//        List<ScanReportFileDescriptor> scanReports = testResult.getColumn("report");
//        assertThat(scanReports).hasSize(1);
//
//        ScanReportFileDescriptor scanReport = scanReports.get(0);
//        assertThat(scanReport.getApplicationId()).isEqualTo("test-application");
//        assertThat(scanReport.getScanId()).isEqualTo("123abc456def");
//        assertThat(scanReport.getPolicyAction()).isEqualTo("Failure");
//
//        testPolicyEvaluationResult(scanReport.getPolicyEvaluationResult());

        store.commitTransaction();
    }

}
